"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Trash2, ShoppingBag, ChevronDown, ChevronUp, Star, LogOut, MapPin, User, Search, Check, Package, Truck, Clock, CheckCircle2 } from "lucide-react";
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
  const [addressForm, setAddressForm] = useState({ fullName: "", street: "", city: "", state: "", zipCode: "", country: "Pakistan" });

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState(null);

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

  // Per-order timeline data cache
  const [orderTimelines, setOrderTimelines] = useState({});
  const [loadingTimeline, setLoadingTimeline] = useState(null);

  // Product rating hover state per order
  const [orderHoverRatings, setOrderHoverRatings] = useState({});

  const router = useRouter();

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
        setReviewForm({ rating: 5, title: "", comment: "", customerName: "", recommend: true });
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

  const fetchOrderTimeline = async (orderId) => {
    if (orderTimelines[orderId]) {
      // Toggle: if already showing this timeline, hide it
      setExpandedTimelineId(prev => prev === orderId ? null : orderId);
      return;
    }
    setLoadingTimeline(orderId);
    try {
      const res = await fetch(`/api/profile/orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrderTimelines(prev => ({ ...prev, [orderId]: data.order }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimeline(null);
      setExpandedTimelineId(prev => prev === orderId ? null : orderId);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !userData) return null;

  const inputClass = "w-full bg-background border border-border rounded-[4px] px-3.5 py-2.5 text-xs font-semibold focus:border-primary outline-none transition-all text-foreground";

  const getInitials = (name) => {
    if (!name) return "PA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(userData.name);

  const pendingCount = (userData.orderHistory || []).filter(o => o.status === 'Pending').length || 0;
  const confirmedCount = (userData.orderHistory || []).filter(o => o.status === 'Confirmed').length || 0;
  const dispatchedCount = (userData.orderHistory || []).filter(o => ['Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status)).length || 0;
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
    return `${day}-${month}-${year} ${pad(hours)}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border border-red-100';
      case 'Confirmed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Shipped':
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border border-purple-100';
      default: return 'bg-orange-50 text-orange-700 border border-orange-100';
    }
  };

  const timelineSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  return (
    <div className="min-h-screen bg-background text-black font-sans selection:bg-primary selection:text-background">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 pt-8 pb-12">
        <div className="w-full mx-auto">

          {/* Main Dashboard Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left Column: Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">

              {/* User Profile Card */}
              <div className="bg-secondary border border-black/10 p-6 rounded-[4px] shadow-sm">
                <div className="flex flex-col items-center text-center gap-3 pb-5">
                  {/* Initials Avatar */}
                  <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-base font-black uppercase shadow-sm border border-black/5 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-[14px] font-black uppercase tracking-wider text-black">{userData.name}</h2>
                    <p className="text-[10px] text-black font-mono mt-0.5">{userData.addresses?.[0]?.phone || ""}</p>
                    <p className="text-[10px] text-black font-mono mt-0.5">{userData.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10">
                  {editingInfo ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-black">Full Name</label>
                        <input
                          className={inputClass}
                          value={infoForm.name}
                          onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-black">Email Address</label>
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
                          className="flex-1 bg-black text-white py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-foreground transition-all cursor-pointer shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingInfo(false)}
                          className="flex-1 border border-black/15 text-black hover:bg-secondary py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => setEditingInfo(true)}
                        className="w-full border border-black/15 text-black hover:bg-secondary py-2.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full bg-black text-white hover:bg-foreground py-2.5 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Statistics Block (2x2 Grid) â€” Bata reference style */}
              <div className="bg-secondary border border-black/10 p-5 rounded-[4px] shadow-sm">
                <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-black/10 border border-black/10 rounded-[4px] overflow-hidden">
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-[8px] font-bold text-orange-600 uppercase tracking-widest">Pending</p>
                    <p className="text-2xl font-black text-black font-mono">{pendingCount}</p>
                  </div>
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">Confirmed</p>
                    <p className="text-2xl font-black text-black font-mono">{confirmedCount}</p>
                  </div>
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-[8px] font-bold text-purple-600 uppercase tracking-widest">Dispatched</p>
                    <p className="text-2xl font-black text-black font-mono">{dispatchedCount}</p>
                  </div>
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest">Delivered</p>
                    <p className="text-2xl font-black text-black font-mono">{deliveredCount}</p>
                  </div>
                </div>
              </div>

              {/* Saved Locations Block */}
              <div className="space-y-4 bg-secondary border border-black/10 p-6 rounded-[4px] shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-black flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Saved Addresses</h2>
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
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-background rounded-[4px] border border-black/[0.06] space-y-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-wider text-black">Recipient Name</label>
                          <input placeholder="Full Name" className={inputClass} value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-wider text-black">Street Address</label>
                          <input placeholder="Street" className={inputClass} value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-black">City</label>
                            <input placeholder="City" className={inputClass} value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-black">Zip Code</label>
                            <input placeholder="Zip Code" className={inputClass} value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAction("addAddress", addressForm)}
                          className="w-full bg-black text-white py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-foreground transition-all cursor-pointer shadow-sm"
                        >
                          Save Address
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {!userData.addresses?.length ? (
                    <p className="text-[9px] text-black uppercase tracking-widest text-center py-4 bg-background border border-black/[0.04] rounded-[4px]">
                      No addresses saved.
                    </p>
                  ) : (
                    userData.addresses.map((addr) => (
                      <div key={addr._id} className="p-3 bg-background border border-black/[0.05] rounded-[4px] flex justify-between items-start shadow-sm">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase text-black truncate">{addr.fullName}</p>
                          <p className="text-[9px] text-black uppercase tracking-wider leading-relaxed mt-0.5 truncate">
                            {addr.street}, {addr.city}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAction("deleteAddress", { id: addr._id })}
                          className="text-black hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Delete Account */}
              <div className="pt-3 border-t border-border">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[4px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 text-[9px] font-black uppercase tracking-[0.25em] transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Account
                </button>
              </div>

            </div>

            {/* Right Column: Main Content (8 cols) */}
            <div className="lg:col-span-8 space-y-5">

              {/* Header Navigation Tab + Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-black/10 pb-4">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-2 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
                      activeTab === "active" ? "text-black border-b-2 border-black" : "text-black hover:text-black"
                    }`}
                  >
                    Active Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("previous")}
                    className={`pb-2 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
                      activeTab === "previous" ? "text-black border-b-2 border-black" : "text-black hover:text-black"
                    }`}
                  >
                    Previous Orders
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Order Here"
                    className="w-full bg-secondary border border-black/10 rounded-[4px] pl-9 pr-4 py-2.5 text-[10px] font-bold tracking-widest uppercase placeholder-black/40 focus:border-black outline-none transition-colors text-black"
                  />
                </div>
              </div>

              {/* Order List Rows */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-black/10 rounded-[4px] bg-secondary space-y-4">
                    <ShoppingBag className="w-12 h-12 text-black/10 mx-auto" />
                    <p className="text-[10px] text-black uppercase tracking-[0.2em] font-bold">No orders matched your criteria.</p>
                  </div>
                ) : (
                  filteredOrders.map((order, i) => {
                    const isExpanded = expandedOrderId === order.id;
                    const isTimelineExpanded = expandedTimelineId === order.id;
                    const isDelivered = order.status === 'Delivered' || order.status === 'Completed' || order.payment?.status === 'Paid';
                    const timelineOrder = orderTimelines[order.id];
                    const currentStep = timelineSteps.indexOf(order.status);

                    return (
                      <div
                        key={order.id}
                        className={`border border-black/10 rounded-[4px] bg-background transition-all shadow-sm overflow-hidden ${
                          isExpanded ? 'ring-1 ring-black/10' : 'hover:border-black/20'
                        }`}
                      >
                        {/* Summary Header Row â€” clickable to expand items */}
                        <div
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-secondary transition-colors select-none"
                        >
                          {/* Left Column: Order metadata */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[8px] font-black uppercase text-black tracking-wider">Order Number</span>
                              <span className="text-[11px] font-black text-black font-mono">#{order.orderNumber || i + 1024}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[8px] font-black uppercase text-black tracking-wider">Creation Date</span>
                              <span className="text-[10px] font-bold text-black font-mono">{formatOrderDate(order.date)}</span>
                            </div>
                          </div>

                          {/* Middle Column: Product Rating â€” interactive for delivered orders */}
                          <div className="hidden md:flex flex-col gap-1.5 flex-shrink-0">
                            <span className={`text-[8px] font-black uppercase tracking-wider ${
                              isDelivered ? 'text-black' : 'text-black'
                            }`}>Product Rating</span>
                            <div
                              className="flex items-center gap-0.5"
                              onMouseLeave={() => setOrderHoverRatings(prev => ({ ...prev, [order.id]: 0 }))}
                            >
                              {[1, 2, 3, 4, 5].map((star) => {
                                const hoverVal = orderHoverRatings[order.id] || 0;
                                const isFilled = star <= hoverVal;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    disabled={!isDelivered}
                                    onMouseEnter={() => {
                                      if (isDelivered) setOrderHoverRatings(prev => ({ ...prev, [order.id]: star }));
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isDelivered) return;
                                      // Expand the order row
                                      setExpandedOrderId(order.id);
                                      // Open review form for first item with selected rating
                                      const firstItem = order.items?.[0];
                                      if (firstItem) {
                                        const reviewId = `${order.id}-${firstItem.productId}`;
                                        setActiveReviewId(reviewId);
                                        setReviewForm({
                                          rating: star,
                                          title: '',
                                          comment: '',
                                          customerName: userData.name,
                                          recommend: true
                                        });
                                      }
                                    }}
                                    className={`p-0.5 transition-all ${
                                      isDelivered ? 'cursor-pointer hover:scale-125' : 'cursor-default'
                                    }`}
                                    title={isDelivered ? `Rate ${star} star${star > 1 ? 's' : ''}` : 'Only available after delivery'}
                                  >
                                    <Star className={`w-3.5 h-3.5 transition-colors ${
                                      isDelivered
                                        ? isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-yellow-300'
                                        : 'fill-none text-black'
                                    }`} />
                                  </button>
                                );
                              })}
                            </div>
                            {isDelivered && (
                              <span className="text-[7px] text-black uppercase tracking-widest font-bold">
                                {(orderHoverRatings[order.id] || 0) > 0
                                  ? `Click to rate ${orderHoverRatings[order.id]} star${orderHoverRatings[order.id] > 1 ? 's' : ''}`
                                  : 'Hover to rate'}
                              </span>
                            )}
                          </div>

                          {/* Right Column: Status pill & chevron */}
                          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                            <div className="text-right space-y-1">
                              <span className={`inline-block px-3 py-1 text-[8px] font-black uppercase tracking-[0.15em] rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-black p-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Items & Info Area */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-black/10 bg-secondary p-5 space-y-5">

                                {/* Products List */}
                                <div className="space-y-3">
                                  <p className="text-[9px] font-bold text-black uppercase tracking-wider">Items in this Order</p>
                                  <div className="divide-y divide-black/[0.04] bg-background border border-black/10 rounded-[4px] p-4 space-y-4">
                                    {(order.items || []).map((item, idx) => {
                                      const reviewId = `${order.id}-${item.productId}`;
                                      const showForm = activeReviewId === reviewId;
                                      return (
                                        <div key={idx} className="pt-4 first:pt-0 space-y-4">
                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className="w-10 h-14 rounded-[2px] border border-black/10 overflow-hidden bg-secondary shrink-0">
                                                <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-black uppercase tracking-wider truncate">{item.name}</p>
                                                {item.selectedSize && item.selectedSize !== "Standard" && (
                                                  <p className="text-[8px] font-semibold text-black uppercase tracking-widest mt-0.5">Size: {item.selectedSize}</p>
                                                )}
                                                <p className="text-[9px] font-bold text-black uppercase mt-0.5">Qty {item.quantity}</p>
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
                                                      setReviewForm({ rating: 5, title: "", comment: "", customerName: userData.name, recommend: true });
                                                    }
                                                  }}
                                                  className="text-[9px] border border-black/15 text-black hover:bg-secondary px-3 py-1.5 rounded-[4px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                                                >
                                                  {showForm ? "Cancel" : "Write Review"}
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
                                              className="bg-secondary border border-black/[0.04] rounded-[4px] p-4 mt-2 space-y-4"
                                            >
                                              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                                                  <Check className="w-3.5 h-3.5 text-green-600" /> Verified Purchase Review
                                                </span>
                                              </div>
                                              {reviewSuccessMessage ? (
                                                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-[10px] uppercase font-bold tracking-widest text-center rounded-[2px]">
                                                  {reviewSuccessMessage}
                                                </div>
                                              ) : (
                                                <form onSubmit={(e) => handleReviewSubmit(e, item.productId, order.orderNumber)} className="space-y-3">
                                                  <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase tracking-wider text-black block">Rating</label>
                                                    <div className="flex gap-1.5">
                                                      {[1, 2, 3, 4, 5].map((star) => (
                                                        <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="p-0.5 cursor-pointer hover:scale-110 transition-transform">
                                                          <Star className={`w-4 h-4 ${star <= reviewForm.rating ? "fill-black text-black" : "text-black"}`} />
                                                        </button>
                                                      ))}
                                                    </div>
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase tracking-wider text-black">Headline Title</label>
                                                    <input placeholder="e.g. Absolutely Outstanding!" className={inputClass} value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <label className="text-[8px] font-bold uppercase tracking-wider text-black">Review Comments</label>
                                                    <textarea placeholder="Detail your experience..." rows={3} className={`${inputClass} resize-none`} value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                                                  </div>
                                                  <div className="flex items-center gap-4">
                                                    <label className="text-[8px] font-bold uppercase tracking-wider text-black">Recommend?</label>
                                                    <div className="flex gap-2">
                                                      <button type="button" onClick={() => setReviewForm({ ...reviewForm, recommend: true })} className={`px-3 py-1 rounded-[2px] text-[8px] font-bold uppercase tracking-widest border transition-colors ${reviewForm.recommend ? 'bg-black text-white border-black' : 'border-black/15 text-black'}`}>Yes</button>
                                                      <button type="button" onClick={() => setReviewForm({ ...reviewForm, recommend: false })} className={`px-3 py-1 rounded-[2px] text-[8px] font-bold uppercase tracking-widest border transition-colors ${!reviewForm.recommend ? 'bg-black text-white border-black' : 'border-black/15 text-black'}`}>No</button>
                                                    </div>
                                                  </div>
                                                  <button type="submit" disabled={submittingReview} className="w-full bg-black text-white py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-foreground transition-all cursor-pointer shadow-sm disabled:opacity-50 mt-2">
                                                    {submittingReview ? "Submitting..." : "Submit Review"}
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

                                {/* Total & Order Journey Toggle */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/[0.06]">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-black">Total</span>
                                    <span className="text-[13px] font-black text-black font-mono">${order.total.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (expandedTimelineId === order.id) {
                                          setExpandedTimelineId(null);
                                        } else {
                                          fetchOrderTimeline(order.id);
                                        }
                                      }}
                                      className="bg-black text-white px-4 py-2 rounded-[4px] text-[9px] font-black uppercase tracking-widest hover:bg-foreground transition-all shadow-sm cursor-pointer"
                                    >
                                      {loadingTimeline === order.id ? "Loading..." : isTimelineExpanded ? "Hide Timeline" : "Order Journey"}
                                    </button>
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

                                {/* Inline Order Timeline */}
                                <AnimatePresence>
                                  {isTimelineExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="bg-background border border-black/10 rounded-[4px] p-5 space-y-5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Order Journey</h3>

                                        {/* Progress Stepper */}
                                        <div className="relative px-2">
                                          <div className="absolute left-2 right-2 top-[10px] h-[2px] bg-black/10" />
                                          <div
                                            className="absolute left-2 top-[10px] h-[2px] bg-black transition-all duration-500"
                                            style={{ width: `calc(${currentStep >= 0 ? (currentStep / (timelineSteps.length - 1)) * 100 : 0}% - 4px)` }}
                                          />
                                          <div className="flex justify-between items-start relative z-10">
                                            {timelineSteps.map((step, idx) => {
                                              const active = idx <= currentStep;
                                              const isCurrent = idx === currentStep;
                                              return (
                                                <div key={idx} className="flex flex-col items-center gap-2">
                                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                                                    isCurrent ? 'bg-black text-white border-black scale-110 shadow-md' :
                                                    active ? 'bg-black text-white border-black' :
                                                    'bg-background text-black border-black/20'
                                                  }`}>
                                                    {idx + 1}
                                                  </div>
                                                  <span className={`hidden sm:block text-[8px] font-bold uppercase tracking-wider transition-colors text-center max-w-[60px] leading-tight ${active ? 'text-black font-black' : 'text-black'}`}>
                                                    {step}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Timeline Events */}
                                        {timelineOrder && (
                                          <div className="space-y-4 pt-2">
                                            {(() => {
                                              const events = timelineOrder.timeline?.length > 0
                                                ? timelineOrder.timeline
                                                : [{
                                                    status: order.status,
                                                    message: order.status === 'Pending'
                                                      ? 'Order placed successfully. Awaiting confirmation.'
                                                      : `Order is currently ${order.status.toLowerCase()}.`,
                                                    timestamp: order.date,
                                                    source: 'System'
                                                  }];
                                              return events.map((event, idx) => (
                                                <div key={idx} className="flex gap-4 relative">
                                                  <div className="flex flex-col items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-black shrink-0 mt-0.5" />
                                                    {idx !== events.length - 1 && <div className="w-px flex-1 bg-black/10 mt-1" />}
                                                  </div>
                                                  <div className="space-y-0.5 pb-3 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-black">{event.status}</p>
                                                    <p className="text-[10px] text-black leading-relaxed">{event.message}</p>
                                                    <p className="text-[9px] font-bold text-black uppercase tracking-widest">
                                                      {new Date(event.timestamp).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                  </div>
                                                </div>
                                              ));
                                            })()}
                                          </div>
                                        )}

                                        {/* Shipping Address */}
                                        {timelineOrder?.shippingAddress && (
                                          <div className="pt-4 border-t border-black/[0.06] space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-black flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Delivery Destination</p>
                                            <p className="text-[10px] font-bold text-black leading-relaxed">
                                              {timelineOrder.shippingAddress.fullName}<br />
                                              {timelineOrder.shippingAddress.street}, {timelineOrder.shippingAddress.city}<br />
                                              {timelineOrder.shippingAddress.country}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-[4px] p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-foreground">Confirm Account Deletion</h3>
              <p className="text-xs text-foreground leading-relaxed uppercase tracking-wider font-semibold">
                Are you sure you want to permanently delete your account? This action is irreversible and all your order history will be lost.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-border text-foreground hover:bg-secondary py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
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
