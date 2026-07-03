"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Trash2, ShoppingBag, ChevronDown, ChevronUp, Star, LogOut, MapPin, User, Plus, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [infoForm, setInfoForm] = useState({ name: "", email: "" });
  const [addressForm, setAddressForm] = useState({ fullName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [activeReviewId, setActiveReviewId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    customerName: "",
    recommend: true
  });

  const [preferredCourier, setPreferredCourier] = useState("TCS Courier");
  const [courierSaveSuccess, setCourierSaveSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_courier");
      if (saved) setPreferredCourier(saved);
    }
  }, []);

  const handleReviewSubmit = async (e, productId, orderNumber) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewSuccessMessage("");
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          customerName: reviewForm.customerName || userData?.name || session?.user?.name || "Customer",
          recommend: reviewForm.recommend,
          orderNumber: orderNumber
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccessMessage("Thank you! Your verified review has been submitted.");
        setReviewForm({
          rating: 5,
          title: "",
          comment: "",
          customerName: "",
          recommend: true
        });
        setTimeout(() => {
          setActiveReviewId(null);
          setReviewSuccessMessage("");
        }, 3000);
      } else {
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setInfoForm({ name: data.name, email: data.email });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (status === "unauthenticated") {
        router.push("/login");
      } else if (status === "authenticated") {
        fetchUserData();
      }
    });
  }, [status, router, fetchUserData]);

  const handleAction = async (action, data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data })
      });
      if (res.ok) {
        await fetchUserData();
        setEditingInfo(false);
        setShowAddressForm(false);
        if (action === "deleteAccount") signOut({ callbackUrl: "/" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !userData) return null;

  const inputClass = "w-full bg-white border border-neutral-300 rounded-[4px] px-3.5 py-2.5 text-xs font-semibold focus:border-black outline-none transition-all text-black";
  const sectionHeadingClass = "text-[11px] uppercase tracking-widest text-black font-bold";

  const getInitials = (name) => {
    if (!name) return "PA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(userData.name);

  const pendingCount = (userData.orderHistory || []).filter(o => o.status === 'Pending').length || 0;
  const confirmedCount = (userData.orderHistory || []).filter(o => o.status === 'Confirmed').length || 0;
  const processingCount = (userData.orderHistory || []).filter(o => ['Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status)).length || 0;
  const deliveredCount = (userData.orderHistory || []).filter(o => o.status === 'Delivered').length || 0;

  const filteredOrders = (userData.orderHistory || []).filter(order => {
    const isCompleted = ['Delivered', 'Cancelled', 'Refunded'].includes(order.status);
    const matchesTab = activeTab === 'previous' ? isCompleted : !isCompleted;
    
    const matchesQuery = searchQuery === "" || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items || []).some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesTab && matchesQuery;
  });

  const formatOrderDate = (dateString) => {
    const d = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = `${pad(hours)}:${minutes} ${ampm}`;
    return `${day}-${month}-${year} ${strTime}`;
  };

  const getCourierName = (orderId, i) => {
    const courierOptions = ["TCS Courier", "Leopards Courier", "DHL Express", "FedEx"];
    const index = (orderId?.charCodeAt(orderId.length - 1) || i) % courierOptions.length;
    return courierOptions[index];
  };

  const saveCourierPreference = () => {
    localStorage.setItem("preferred_courier", preferredCourier);
    setCourierSaveSuccess(true);
    setTimeout(() => setCourierSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Matches site margins/padding */}
      <div className="container mx-auto px-2 sm:px-4 md:px-8 pt-12 pb-12">
        <div className="w-full mx-auto">

          {/* Header - Luxury Banner */}
          <div className="border-b border-black/10 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">Account Dashboard</span>
              <h1 className="text-[24px] font-bold uppercase tracking-[0.1em] text-black mt-0.5">My Account</h1>
            </div>
          </div>

          {/* Main Dashboard Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column: Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* User Profile Card */}
              <div className="bg-[#FAF9F6] border border-black/10 p-6 rounded-[4px] shadow-sm relative">
                <div className="flex items-center gap-4">
                  {/* Initials Avatar */}
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-sm font-black uppercase shadow-sm border border-black/5 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-black uppercase tracking-wider text-black truncate">{userData.name}</h2>
                    <p className="text-[10px] text-black/60 font-mono mt-0.5 truncate">{userData.email}</p>
                    <p className="text-[10px] text-black/60 font-mono mt-0.5">{userData.addresses?.[0]?.phone || "+92 300 1234567"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 mt-4">
                  {editingInfo ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-black/60">Full Name</label>
                        <input
                          className={inputClass}
                          value={infoForm.name}
                          onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-black/60">Email Address</label>
                        <input
                          className={inputClass}
                          value={infoForm.email}
                          onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                          placeholder="Email"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction("updateInfo", infoForm)}
                          className="flex-1 bg-black text-white py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingInfo(false)}
                          className="flex-1 border border-black/15 text-black hover:bg-neutral-50 py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setEditingInfo(true)}
                        className="w-full border border-black/15 text-black hover:bg-neutral-50 py-2.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full bg-black text-white hover:bg-neutral-900 py-2.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Statistics Block (2x2 Grid) */}
              <div className="bg-[#FAF9F6] border border-black/10 p-6 rounded-[4px] shadow-sm space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Acquisitions Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-black/10 p-4 rounded-[4px] space-y-1">
                    <p className="text-[8px] font-bold text-black/60 uppercase tracking-widest">Pending</p>
                    <p className="text-xl font-black text-orange-600 font-mono">{pendingCount}</p>
                  </div>
                  <div className="bg-white border border-black/10 p-4 rounded-[4px] space-y-1">
                    <p className="text-[8px] font-bold text-black/60 uppercase tracking-widest">Confirmed</p>
                    <p className="text-xl font-black text-blue-600 font-mono">{confirmedCount}</p>
                  </div>
                  <div className="bg-white border border-black/10 p-4 rounded-[4px] space-y-1">
                    <p className="text-[8px] font-bold text-black/60 uppercase tracking-widest">Processing</p>
                    <p className="text-xl font-black text-purple-600 font-mono">{processingCount}</p>
                  </div>
                  <div className="bg-white border border-black/10 p-4 rounded-[4px] space-y-1">
                    <p className="text-[8px] font-bold text-black/60 uppercase tracking-widest">Delivered</p>
                    <p className="text-xl font-black text-green-600 font-mono">{deliveredCount}</p>
                  </div>
                </div>
              </div>

              {/* Choose Preferred Courier for Future Deliveries */}
              <div className="bg-[#FAF9F6] border border-black/10 p-6 rounded-[4px] shadow-sm space-y-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-black leading-snug">Choose Your Preferred Courier for Future Deliveries</h3>
                  <p className="text-[8px] text-black/60 uppercase tracking-wider mt-1">We will try our best to dispatch your order with this logistics partner.</p>
                </div>
                <div className="space-y-3">
                  <select
                    value={preferredCourier}
                    onChange={(e) => setPreferredCourier(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-[4px] px-3.5 py-2.5 text-xs font-semibold focus:border-black outline-none transition-all text-black cursor-pointer"
                  >
                    <option value="TCS Courier">TCS Courier</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="DHL Express">DHL Express</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Pakistan Post">Pakistan Post</option>
                    <option value="M&P Express">M&P Express</option>
                  </select>
                  <button
                    onClick={saveCourierPreference}
                    className="w-full bg-black text-white py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {courierSaveSuccess ? (
                      <>Preference Saved!</>
                    ) : (
                      <>Save Preference</>
                    )}
                  </button>
                </div>
              </div>

              {/* Saved Locations Block */}
              <div className="space-y-6 bg-[#FAF9F6] border border-black/10 p-6 rounded-[4px] shadow-sm">
                <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-black flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Saved Locations</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[9px] font-black uppercase tracking-widest text-black hover:underline underline-offset-4 cursor-pointer"
                  >
                    {showAddressForm ? "Cancel" : "Add New"}
                  </button>
                </div>

                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="p-4 bg-white rounded-[4px] border border-black/[0.06] space-y-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">Recipient Name</label>
                          <input placeholder="Full Name" className={inputClass} value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">Street Address</label>
                          <input placeholder="Street" className={inputClass} value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">City</label>
                            <input placeholder="City" className={inputClass} value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">Zip Code</label>
                            <input placeholder="Zip Code" className={inputClass} value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAction("addAddress", addressForm)}
                          className="w-full bg-black text-white py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer shadow-sm"
                        >
                          Save Address
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {userData.addresses?.length === 0 ? (
                    <p className="text-[9px] text-black/60 uppercase tracking-widest text-center py-4 bg-white border border-black/[0.04] rounded-[4px]">
                      No locations saved.
                    </p>
                  ) : (
                    userData.addresses.map((addr) => (
                      <div key={addr._id} className="p-4 bg-white border border-black/[0.05] rounded-[4px] flex justify-between items-start shadow-sm">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase text-black truncate">{addr.fullName}</p>
                          <p className="text-[9px] text-black/70 uppercase tracking-wider leading-relaxed mt-1 truncate">
                            {addr.street}, {addr.city}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAction("deleteAddress", { id: addr._id })}
                          className="text-black/50 hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Main Content (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Header Navigation Tab + Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-black/10 pb-4">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-2 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
                      activeTab === "active" ? "text-black border-b-2 border-black" : "text-black/40 hover:text-black"
                    }`}
                  >
                    Active Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("previous")}
                    className={`pb-2 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
                      activeTab === "previous" ? "text-black border-b-2 border-black" : "text-black/40 hover:text-black"
                    }`}
                  >
                    Previous Orders
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Order Here"
                    className="w-full bg-[#FAF9F6] border border-black/10 rounded-[4px] pl-9 pr-4 py-2.5 text-[10px] font-bold tracking-widest uppercase placeholder-black/40 focus:border-black outline-none transition-colors text-black"
                  />
                </div>
              </div>

              {/* Order List Rows */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-black/10 rounded-[4px] bg-[#FAF9F6] space-y-4">
                    <ShoppingBag className="w-12 h-12 text-black/10 mx-auto" />
                    <div>
                      <p className="text-[10px] text-black/80 uppercase tracking-[0.2em] font-bold">No orders matched your criteria.</p>
                    </div>
                  </div>
                ) : (
                  filteredOrders.map((order, i) => {
                    const isExpanded = expandedOrderId === order.id;
                    const isDelivered = order.status === 'Delivered' || order.status === 'Completed' || order.payment?.status === 'Paid';
                    const courierBrand = getCourierName(order.id, i);
                    
                    return (
                      <div 
                        key={order.id} 
                        className={`border border-black/10 rounded-[4px] bg-white transition-all shadow-sm overflow-hidden ${
                          isExpanded ? 'ring-1 ring-black/10' : 'hover:border-black/20'
                        }`}
                      >
                        {/* Summary Header Row */}
                        <div 
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                        >
                          {/* Left Column: Order metadata */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[8px] font-black uppercase text-black/40 tracking-wider">Order ID:</span>
                              <span className="text-[11px] font-black text-black font-mono">#{order.orderNumber || i + 1024}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[8px] font-black uppercase text-black/40 tracking-wider">Tracking ID:</span>
                              <span className="text-[10px] font-bold text-black/85 font-mono">TRK-{order.orderNumber ? (order.orderNumber * 773 + 1248301) : (i * 921 + 7794181)}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[8px] font-black uppercase text-black/40 tracking-wider">Creation Date:</span>
                              <span className="text-[10px] font-bold text-black/85 font-mono">{formatOrderDate(order.date)}</span>
                            </div>
                          </div>

                          {/* Middle Column: Logistics / Courier preference & Stars */}
                          <div className="space-y-1 flex-1 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase text-black/40 tracking-wider">Courier:</span>
                              <span className="text-[10px] font-black uppercase text-black tracking-widest">{courierBrand}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                              ))}
                            </div>
                          </div>

                          {/* Right Column: Status pill & chevron */}
                          <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 text-[8px] font-black uppercase tracking-[0.15em] rounded-[2px] ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                                order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                order.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-100 font-semibold' :
                                'bg-orange-50 text-orange-700 border border-orange-100 font-semibold'
                              }`}>
                                {order.status}
                              </span>
                              <p className="text-[11px] font-black text-black font-mono mt-1">${order.total.toLocaleString()}</p>
                            </div>
                            <div className="text-black/50 p-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Items & Info Area */}
                        {isExpanded && (
                          <div className="border-t border-black/10 bg-[#FAF9F6]/40 p-5 space-y-6 animate-in slide-in-from-top-1 duration-150">
                            
                            {/* Products List */}
                            <div className="space-y-4">
                              <p className="text-[9px] font-bold text-black/40 uppercase tracking-wider">Acquisitions Included</p>
                              <div className="divide-y divide-black/[0.04] bg-white border border-black/10 rounded-[4px] p-4 space-y-4">
                                {(order.items || []).map((item, idx) => {
                                  const reviewId = `${order.id}-${item.productId}`;
                                  const showForm = activeReviewId === reviewId;
                                  return (
                                    <div key={idx} className="pt-4 first:pt-0 space-y-4">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-10 h-14 rounded-[2px] border border-black/10 overflow-hidden bg-[#FAF9F6] shrink-0">
                                            <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-black uppercase tracking-wider truncate">{item.name}</p>
                                            {item.selectedSize && item.selectedSize !== "Standard" && (
                                              <p className="text-[8px] font-semibold text-black/50 uppercase tracking-widest mt-0.5">Size: {item.selectedSize}</p>
                                            )}
                                            <p className="text-[9px] font-bold text-black/70 uppercase mt-0.5">Qty {item.quantity}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                                          {isDelivered && (
                                            <button
                                              onClick={() => {
                                                if (showForm) {
                                                  setActiveReviewId(null);
                                                } else {
                                                  setActiveReviewId(reviewId);
                                                  setReviewForm({
                                                    rating: 5,
                                                    title: "",
                                                    comment: "",
                                                    customerName: userData.name,
                                                    recommend: true
                                                  });
                                                }
                                              }}
                                              className="text-[9px] border border-black/15 text-black hover:bg-neutral-50 px-3 py-1.5 rounded-[4px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                                            >
                                              {showForm ? "Cancel Review" : "Write Review"}
                                            </button>
                                          )}
                                          <p className="text-xs font-bold text-black font-mono">${(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                                        </div>
                                      </div>

                                      {/* Verified Review Submission Form */}
                                      {showForm && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          className="bg-[#FAF9F6] border border-black/[0.04] rounded-[4px] p-4 mt-2 space-y-4"
                                        >
                                          <div className="flex items-center justify-between border-b border-black/5 pb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                                              <Check className="w-3.5 h-3.5 text-green-600" /> Submit Verified Purchase Review
                                            </span>
                                          </div>

                                          {reviewSuccessMessage ? (
                                            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-[10px] uppercase font-bold tracking-widest text-center rounded-[2px]">
                                              {reviewSuccessMessage}
                                            </div>
                                          ) : (
                                            <form onSubmit={(e) => handleReviewSubmit(e, item.productId, order.orderNumber)} className="space-y-3">
                                              
                                              {/* Stars Picker */}
                                              <div className="space-y-1">
                                                <label className="text-[8px] font-bold uppercase tracking-wider text-black/60 block">Rating</label>
                                                <div className="flex gap-1.5">
                                                  {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                      type="button"
                                                      key={star}
                                                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                      className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                                                    >
                                                      <Star className={`w-4 h-4 ${star <= reviewForm.rating ? "fill-black text-black" : "text-black/25"}`} />
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>

                                              <div className="space-y-1">
                                                <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">Headline Title</label>
                                                <input
                                                  placeholder="e.g. Absolutely Outstanding!"
                                                  className={inputClass}
                                                  value={reviewForm.title}
                                                  onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                />
                                              </div>

                                              <div className="space-y-1">
                                                <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">Review Comments</label>
                                                <textarea
                                                  placeholder="Detail your acquisition experience..."
                                                  rows={3}
                                                  className={`${inputClass} resize-none`}
                                                  value={reviewForm.comment}
                                                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                />
                                              </div>

                                              <div className="flex items-center gap-4">
                                                <label className="text-[8px] font-bold uppercase tracking-wider text-black/60">Would you recommend this item?</label>
                                                <div className="flex gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, recommend: true })}
                                                    className={`px-3 py-1 rounded-[2px] text-[8px] font-bold uppercase tracking-widest border transition-colors ${
                                                      reviewForm.recommend ? 'bg-black text-white border-black' : 'border-black/15 text-black'
                                                    }`}
                                                  >
                                                    Yes
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, recommend: false })}
                                                    className={`px-3 py-1 rounded-[2px] text-[8px] font-bold uppercase tracking-widest border transition-colors ${
                                                      !reviewForm.recommend ? 'bg-black text-white border-black' : 'border-black/15 text-black'
                                                    }`}
                                                  >
                                                    No
                                                  </button>
                                                </div>
                                              </div>

                                              <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="w-full bg-black text-white py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer shadow-sm disabled:opacity-50 mt-2"
                                              >
                                                {submittingReview ? "Submitting Review..." : "Submit Review"}
                                              </button>
                                            </form>
                                          )}
                                        </motion.div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Row Footer Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/[0.04]">
                              <Link 
                                href={`/profile/orders/${order.id}`}
                                className="bg-black text-white px-5 py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-sm"
                              >
                                View Order Timeline & Tracking
                              </Link>
                              {['Pending', 'Confirmed', 'Processing'].includes(order.status) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAction("cancelOrder", { orderId: order.id });
                                  }}
                                  className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline cursor-pointer"
                                >
                                  Request Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* Minimal Footer Action */}
          <div className="flex flex-col items-center pt-16 mt-16 border-t border-black/10 space-y-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[9px] text-black/50 hover:text-red-600 uppercase tracking-[0.3em] font-bold transition-colors cursor-pointer"
            >
              Delete Account
            </button>
            <div className="w-1 h-1 bg-black/10 rounded-full" />
            <p className="text-[8px] text-black/40 uppercase tracking-[0.5em] font-bold">PAIRO COLLECTION</p>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-[4px] p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-black">Confirm Account Deletion</h3>
              <p className="text-xs text-black/60 leading-relaxed uppercase tracking-wider font-semibold">
                Are you sure you want to permanently delete your account? This action is irreversible and all your acquisition history will be lost.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-black/15 text-black hover:bg-neutral-50 py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("deleteAccount")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
