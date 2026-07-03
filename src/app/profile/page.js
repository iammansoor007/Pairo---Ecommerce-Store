"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Trash2, ShoppingBag, ChevronDown, ChevronUp, Star, LogOut, MapPin, User, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

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

  // User notification/feedback state
  const [feedback, setFeedback] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setFeedback(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data })
      });
      const resData = await res.json();
      if (res.ok) {
        await fetchUserData();
        setEditingInfo(false);
        setShowAddressForm(false);
        if (resData.message) {
          setFeedback({ type: "success", message: resData.message });
        }
      } else {
        setFeedback({ type: "error", message: resData.message || "Failed to complete action." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "An unexpected error occurred. Please try again." });
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

  const inputClass = "w-full bg-background border border-border rounded-[12px] px-4 py-3 text-[11px] font-semibold focus:border-primary outline-none transition-all text-foreground";

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
          <section className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/50">account dashboard</p>
            <h1 className="mt-4 text-[32px] sm:text-[38px] font-black uppercase tracking-[-0.03em] text-foreground">My Profile</h1>
            <p className="mt-3 max-w-2xl text-[11px] uppercase tracking-[0.2em] text-foreground/70 leading-7">
              Your account hub for orders, shipping details, and verified purchase updates.
            </p>
          </section>

          {/* Main Dashboard Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left Column: Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Feedback alert */}
              {feedback && (
                <div className={`p-4 rounded-[4px] border text-[10px] font-black uppercase tracking-widest text-center shadow-sm ${
                  feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {feedback.message}
                </div>
              )}

              {/* User Profile Card */}
              <div className="bg-secondary border border-border p-6 rounded-[20px] shadow-[0_14px_30px_-22px_rgba(0,0,0,0.25)]">
                <div className="flex flex-col items-center text-center gap-3 pb-5">
                  {/* Initials Avatar */}
                  <div className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center text-lg font-black uppercase shadow-md border border-border shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black uppercase tracking-wider text-foreground">{userData.name}</h2>
                    {userData.addresses?.[0]?.phone && (
                      <p className="text-[11px] text-foreground font-mono mt-0.5">{userData.addresses[0].phone}</p>
                    )}
                    <p className="text-[11px] text-foreground font-mono mt-0.5">{userData.email}</p>
                    {userData.pendingEmail && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-[4px] text-[8px] font-bold uppercase tracking-wider leading-relaxed shadow-sm">
                        Verification pending for:<br/>
                        <span className="font-mono lowercase text-[9px] block mt-0.5 font-bold text-amber-800">{userData.pendingEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  {editingInfo ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-foreground">Full Name</label>
                        <input
                          className={inputClass}
                          value={infoForm.name}
                          onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-foreground">Email Address</label>
                        <input
                          className={inputClass}
                          value={infoForm.email}
                          onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                          placeholder="Email"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction("updateInfo", infoForm)}
                          className="flex-1 bg-primary text-background py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-95 transition-all cursor-pointer shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingInfo(false)}
                          className="flex-1 border border-border text-foreground hover:bg-secondary py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => setEditingInfo(true)}
                        className="w-full border border-border text-foreground hover:bg-secondary py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full bg-primary text-background hover:opacity-90 py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Statistics Block (2x2 Grid) - reference style */}
              <div className="bg-secondary border border-border rounded-[20px] shadow-[0_14px_30px_-22px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-border bg-background text-center">
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-2xl font-black text-foreground font-mono">{pendingCount}</p>
                    <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">Pending</p>
                  </div>
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-2xl font-black text-foreground font-mono">{confirmedCount}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Confirmed</p>
                  </div>
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-2xl font-black text-foreground font-mono">{dispatchedCount}</p>
                    <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Dispatched</p>
                  </div>
                  <div className="p-4 space-y-1 bg-background">
                    <p className="text-2xl font-black text-foreground font-mono">{deliveredCount}</p>
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Delivered</p>
                  </div>
                </div>
              </div>

              {/* Saved Locations Block */}
              <div className="space-y-4 bg-secondary border border-border p-6 rounded-[20px] shadow-[0_14px_30px_-22px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.1em] text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Saved Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[9px] font-black uppercase tracking-widest text-foreground hover:underline underline-offset-4 cursor-pointer"
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
                      <div className="p-4 bg-background rounded-[12px] border border-border space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground">Recipient Name</label>
                          <input placeholder="Full Name" className={inputClass} value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground">Street Address</label>
                          <input placeholder="Street" className={inputClass} value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground">City</label>
                            <input placeholder="City" className={inputClass} value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground">Zip Code</label>
                            <input placeholder="Zip Code" className={inputClass} value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAction("addAddress", addressForm)}
                          className="w-full bg-primary text-background py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all cursor-pointer shadow-sm"
                        >
                          Save Address
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {!userData.addresses?.length ? (
                    <p className="text-[9px] text-foreground/50 uppercase tracking-widest text-center py-4 bg-background border border-border rounded-[12px]">
                      No addresses saved.
                    </p>
                  ) : (
                    userData.addresses.map((addr) => (
                      <div key={addr._id} className="p-4 bg-background border border-border rounded-[12px] flex justify-between items-start shadow-sm">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase text-foreground truncate">{addr.fullName}</p>
                          <p className="text-[9px] text-foreground/60 uppercase tracking-wider leading-relaxed mt-0.5 truncate">
                            {addr.street}, {addr.city}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAction("deleteAddress", { id: addr._id })}
                          className="text-foreground hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
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
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-border pb-4">
                <div className="flex gap-2 p-1 bg-secondary rounded-[30px] border border-border">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-[25px] transition-all cursor-pointer ${
                      activeTab === "active"
                        ? "bg-primary text-background shadow-sm"
                        : "text-foreground/75 hover:text-foreground"
                    }`}
                  >
                    Active Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("previous")}
                    className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-[25px] transition-all cursor-pointer ${
                      activeTab === "previous"
                        ? "bg-primary text-background shadow-sm"
                        : "text-foreground/75 hover:text-foreground"
                    }`}
                  >
                    Previous Orders
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Order Here"
                    className="w-full bg-background border border-border rounded-[30px] pl-10 pr-4 py-2.5 text-xs font-semibold placeholder:text-foreground/45 focus:border-primary outline-none transition-colors text-foreground"
                  />
                </div>
              </div>

              {/* Order List Rows */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-border rounded-[20px] bg-secondary space-y-4">
                    <ShoppingBag className="w-12 h-12 text-foreground/10 mx-auto" />
                    <p className="text-[10px] text-foreground/60 uppercase tracking-[0.2em] font-bold">No orders matched your criteria.</p>
                  </div>
                ) : (
                  filteredOrders.map((order, i) => {
                    const isExpanded = expandedOrderId === order.id;
                    const isDelivered = order.status === 'Delivered' || order.status === 'Completed' || order.payment?.status === 'Paid';
                    
                    // Stepper status mapping
                    const timelineOrder = orderTimelines[order.id];
                    const stepperSteps = ['Pending', 'Confirmed', 'In transit', 'Out for delivery', 'Delivered'];
                    
                    let currentStepIndex = 0;
                    if (order.status === 'Confirmed') currentStepIndex = 1;
                    else if (['Processing', 'Packed', 'Shipped'].includes(order.status)) currentStepIndex = 2;
                    else if (order.status === 'Out for Delivery') currentStepIndex = 3;
                    else if (order.status === 'Delivered') currentStepIndex = 4;

                    return (
                      <div
                        key={order.id}
                        className={`border border-border rounded-[20px] bg-background transition-all shadow-sm overflow-hidden ${
                          isExpanded ? 'ring-1 ring-primary/10' : 'hover:border-border/80'
                        }`}
                      >
                        {/* Summary Header Row (Table format matching mockup) */}
                        <div
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="px-6 py-5 grid grid-cols-2 md:grid-cols-5 items-center gap-4 cursor-pointer hover:bg-secondary transition-colors select-none text-left"
                        >
                          {/* Col 1: Order Number */}
                          <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-foreground/50 tracking-wider">Order Number</p>
                            <p className="text-[11px] font-black text-foreground font-mono">#{order.orderNumber}</p>
                          </div>

                          {/* Col 2: Creation Date */}
                          <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-foreground/50 tracking-wider">Creation Date</p>
                            <p className="text-[10px] font-bold text-foreground font-mono">{formatOrderDate(order.date)}</p>
                          </div>

                          {/* Col 3: Product Rating */}
                          <div className="space-y-1 col-span-2 md:col-span-1">
                            <p className="text-[8px] font-black uppercase text-foreground/50 tracking-wider">Product Rating</p>
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
                                      setExpandedOrderId(order.id);
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
                                  >
                                    <Star className={`w-3 h-3 transition-colors ${
                                      isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-foreground/20'
                                    }`} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Col 4: Status Badge */}
                          <div className="flex md:justify-center">
                            <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Col 5: Chevron */}
                          <div className="flex justify-end text-foreground/60">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                                    <div className="border-t border-border bg-secondary p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                      
                                      {/* Left Column: ORDER DETAIL */}
                                      <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/60 border-b border-border pb-1.5">Order Detail</h4>
                                        
                                        {/* Line Items */}
                                        <div className="space-y-3">
                                          <p className="text-[8px] font-bold text-foreground/45 uppercase tracking-widest">Line Items</p>
                                          <div className="divide-y divide-border/30 bg-background border border-border rounded-[4px] p-4 space-y-4">
                                            {(order.items || []).map((item, idx) => {
                                              const reviewId = `${order.id}-${item.productId}`;
                                              const showForm = activeReviewId === reviewId;
                                              return (
                                                <div key={idx} className="pt-4 first:pt-0 space-y-3">
                                                  <div className="flex justify-between items-center gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                      <div className="w-12 h-16 rounded-[2px] border border-border overflow-hidden bg-secondary shrink-0 relative">
                                                        <Image src={item.image || "/placeholder.jpg"} alt={item.name || "Product image"} fill className="object-cover" />
                                                      </div>
                                                      <div className="min-w-0">
                                                        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider truncate">{item.name}</p>
                                                        <p className="text-[8px] font-semibold text-foreground/50 uppercase tracking-widest mt-0.5">
                                                          {item.selectedSize ? `Size: ${item.selectedSize}` : ''} {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-foreground/60 uppercase mt-0.5">Qty {item.quantity}</p>
                                                        
                                                        {/* Product Star Rating under Title */}
                                                        <div className="flex items-center gap-0.5 mt-1">
                                                          {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} className={`w-2.5 h-2.5 ${star <= (item.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-foreground/20'}`} />
                                                          ))}
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                      <p className="text-xs font-bold text-foreground font-mono">${(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
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
                                                          className="text-[8px] border border-border text-foreground hover:bg-secondary px-2.5 py-1 rounded-[4px] font-bold uppercase tracking-widest cursor-pointer transition-colors mt-2 block ml-auto"
                                                        >
                                                          {showForm ? "Cancel" : "Write Review"}
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Review Form */}
                                                  {showForm && (
                                                    <div className="bg-secondary border border-border rounded-[4px] p-4 mt-2 space-y-4">
                                                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-green-600" /> Verified Purchase Review
                                                      </span>
                                                      {reviewSuccessMessage ? (
                                                        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-[10px] uppercase font-bold tracking-widest text-center rounded-[2px]">
                                                          {reviewSuccessMessage}
                                                        </div>
                                                      ) : (
                                                        <form onSubmit={(e) => handleReviewSubmit(e, item.productId, order.orderNumber)} className="space-y-3">
                                                          <div className="space-y-1">
                                                            <label className="text-[8px] font-bold uppercase tracking-wider text-foreground block">Rating</label>
                                                            <div className="flex gap-1.5">
                                                              {[1, 2, 3, 4, 5].map((star) => (
                                                                <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="p-0.5 cursor-pointer hover:scale-110 transition-transform">
                                                                  <Star className={`w-4 h-4 ${star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-foreground/20"}`} />
                                                                </button>
                                                              ))}
                                                            </div>
                                                          </div>
                                                          <div className="space-y-1">
                                                            <label className="text-[8px] font-bold uppercase tracking-wider text-foreground">Headline Title</label>
                                                            <input placeholder="e.g. Absolutely Outstanding!" className={inputClass} value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                                                          </div>
                                                          <div className="space-y-1">
                                                            <label className="text-[8px] font-bold uppercase tracking-wider text-foreground">Review Comments</label>
                                                            <textarea placeholder="Detail your experience..." rows={3} className={`${inputClass} resize-none`} value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                                                          </div>
                                                          <button type="submit" disabled={submittingReview} className="w-full bg-primary text-background py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all cursor-pointer">
                                                            {submittingReview ? "Submitting..." : "Submit Review"}
                                                          </button>
                                                        </form>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        <div className="border-t border-border pt-4 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Order Amount</span>
                                            <span className="text-[13px] font-black text-foreground font-mono">${order.total.toLocaleString()}</span>
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 block">Delivery Address</span>
                                            <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider leading-relaxed">
                                              {order.shippingAddress?.fullName || userData.name}<br />
                                              {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                                              {order.shippingAddress?.country || "Pakistan"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right Column: TRACKING HISTORY */}
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-border pb-1.5">
                                          <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/60">Tracking History</h4>
                                          <span className="text-[8px] font-bold text-foreground/45 uppercase tracking-widest">Updated: {formatOrderDate(order.date)}</span>
                                        </div>

                                        <div className="space-y-6">
                                          <h3 className="text-[18px] font-black text-foreground uppercase tracking-wide">{order.status}</h3>
                                          
                                          {/* Horizontal Stepper Progress Indicator */}
                                          <div className="relative pt-6 pb-2 px-2">
                                            {/* Background Connecting Line */}
                                            <div className="absolute left-4 right-4 top-[32px] h-[3px] bg-border" />
                                            
                                            {/* Foreground Green Progress Line */}
                                            <div 
                                              className="absolute left-4 top-[32px] h-[3px] bg-green-500 transition-all duration-500" 
                                              style={{ width: `calc(${currentStepIndex >= 0 ? (currentStepIndex / (stepperSteps.length - 1)) * 100 : 0}% - 8px)` }}
                                            />
                                            
                                            <div className="flex justify-between items-center relative z-10">
                                              {stepperSteps.map((step, idx) => {
                                                const active = idx <= currentStepIndex;
                                                return (
                                                  <div key={idx} className="flex flex-col items-center gap-2.5">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all duration-300 ${
                                                      active 
                                                        ? 'bg-green-500 text-white border-green-500 scale-110 shadow-sm' 
                                                        : 'bg-background text-foreground/30 border-border'
                                                    }`}>
                                                      {active ? "✓" : idx + 1}
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-wider text-center max-w-[64px] leading-tight ${active ? 'text-foreground' : 'text-foreground/40'}`}>
                                                      {step}
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          {/* Cancel request button if pending */}
                                          {['Pending', 'Confirmed', 'Processing'].includes(order.status) && (
                                            <div className="pt-4 text-right">
                                              <button
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  handleAction("cancelOrder", { orderId: order.id });
                                                }}
                                                className="text-[9px] font-black bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-[4px] uppercase tracking-widest hover:bg-red-100 transition-all cursor-pointer"
                                              >
                                                Request Cancellation
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>

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

    </div>
  );
}
