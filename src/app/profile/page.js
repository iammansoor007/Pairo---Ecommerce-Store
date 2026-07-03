"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [infoForm, setInfoForm] = useState({ name: "", email: "" });
  const [addressForm, setAddressForm] = useState({ fullName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });

  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Matches site margins/padding */}
      <div className="container mx-auto px-6 md:px-16 pt-12 pb-12">
        <div className="max-w-6xl mx-auto">

          {/* Header - Luxury Banner */}
          <div className="border-b border-black/10 pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">Account Dashboard</span>
              <h1 className="text-[24px] font-bold uppercase tracking-[0.1em] text-black mt-0.5">My Account</h1>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-6 py-3 bg-black text-white hover:bg-neutral-900 rounded-[4px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Row - Minimal Luxury Accent */}
          <div className="grid grid-cols-2 gap-4 border-b border-black/10 pb-10 mb-10">
            <div>
              <p className="text-[10px] text-black/60 uppercase tracking-[0.2em] font-bold">Total Acquisitions</p>
              <p className="text-3xl font-black tracking-tight font-mono text-black mt-1">
                ${userData.orderHistory?.reduce((acc, o) => acc + o.total, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-black/60 uppercase tracking-[0.2em] font-bold">Orders Placed</p>
              <p className="text-3xl font-black tracking-tight font-mono text-black mt-1">
                {userData.orderHistory?.length || 0}
              </p>
            </div>
          </div>

          {/* Main Dashboard Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Recent Order History (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-black">Order History</h2>
                <span className="text-[9px] font-bold text-black/60 uppercase tracking-widest">{userData.orderHistory?.length || 0} Orders</span>
              </div>

              {userData.orderHistory?.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-black/10 rounded-[4px] bg-[#FAF9F6]">
                  <p className="text-[10px] text-black/60 uppercase tracking-[0.2em] font-bold">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.orderHistory.map((order, i) => (
                    <div key={i} className="border border-black/[0.08] p-5 rounded-[4px] space-y-4 bg-white hover:border-black/20 transition-all shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] font-black uppercase tracking-wider text-black">Order #{order.orderNumber || i + 1024}</p>
                          <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[2px] ${order.status === 'Delivered' ? 'bg-black text-white' :
                              order.status === 'Cancelled' ? 'bg-neutral-100 text-black font-semibold' :
                                'bg-neutral-100 text-black border border-black/5'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-black font-mono">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-black/[0.03]">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {(order.items || []).slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-8 h-10 rounded-[2px] border border-white bg-[#FAF9F6] overflow-hidden shrink-0 shadow-sm relative z-[1]">
                              <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-8 h-10 rounded-[2px] border border-white bg-black text-white text-[8px] flex items-center justify-center shadow-sm font-bold relative z-[2]">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-[13px] font-bold text-black font-mono">
                            ${order.total.toLocaleString()}
                          </p>
                          {['Pending', 'Confirmed', 'Processing'].includes(order.status) && (
                            <button
                              onClick={() => handleAction("cancelOrder", { orderId: order.id })}
                              className="text-[8px] font-bold text-red-500 uppercase tracking-widest hover:underline block ml-auto mt-1 cursor-pointer"
                            >
                              Request Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Profile & Addresses (5 cols) */}
            <div className="lg:col-span-5 space-y-12">

              {/* Profile Block */}
              <div className="space-y-6 bg-[#FAF9F6] border border-black/[0.04] p-6 sm:p-8 rounded-[4px]">
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-black">Profile Information</h2>
                  <button
                    onClick={() => setEditingInfo(!editingInfo)}
                    className="text-[9px] font-black uppercase tracking-widest text-black hover:underline underline-offset-4 cursor-pointer"
                  >
                    {editingInfo ? "Cancel" : "Edit Info"}
                  </button>
                </div>

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
                    <button
                      onClick={() => handleAction("updateInfo", infoForm)}
                      className="w-full bg-black text-white py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer mt-2"
                    >
                      Save Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div>
                      <p className="text-[9px] text-black/60 uppercase tracking-[0.2em] font-bold">Display Name</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-black mt-0.5">{userData.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-black/60 uppercase tracking-[0.2em] font-bold">Primary Email</p>
                      <p className="text-xs font-bold text-black mt-0.5">{userData.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Locations Block */}
              <div className="space-y-6">
                <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.1em] text-black">Saved Locations</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[9px] font-black uppercase tracking-widest text-black hover:underline underline-offset-4 cursor-pointer"
                  >
                    {showAddressForm ? "Cancel" : "Add Address"}
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
                      <div className="p-6 bg-[#FAF9F6] rounded-[4px] border border-black/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-black/60">Recipient Name</label>
                          <input placeholder="Full Name" className={inputClass} value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-black/60">Street Address</label>
                          <input placeholder="Street" className={inputClass} value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-black/60">City</label>
                          <input placeholder="City" className={inputClass} value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-black/60">Postal / Zip Code</label>
                          <input placeholder="Zip Code" className={inputClass} value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                        </div>
                        <button
                          onClick={() => handleAction("addAddress", addressForm)}
                          className="sm:col-span-2 bg-black text-white py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer mt-2"
                        >
                          Save Location
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {userData.addresses?.length === 0 ? (
                    <p className="text-[10px] text-black/60 uppercase tracking-widest text-center py-6 font-semibold bg-[#FAF9F6] border border-black/[0.04] rounded-[4px]">
                      No locations saved yet.
                    </p>
                  ) : (
                    userData.addresses.map((addr) => (
                      <div key={addr._id} className="p-5 bg-white border border-black/[0.08] rounded-[4px] flex justify-between items-start shadow-sm hover:border-black/25 transition-all">
                        <div>
                          <p className="text-xs font-bold uppercase mb-1.5 text-black">{addr.fullName}</p>
                          <p className="text-[11px] text-black uppercase tracking-wider leading-relaxed font-bold">
                            {addr.street}<br />
                            {addr.city}, {addr.zipCode}<br />
                            {addr.country || "United States"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAction("deleteAddress", { id: addr._id })}
                          className="text-black/60 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Minimal Footer Action */}
          <div className="flex flex-col items-center pt-16 mt-16 border-t border-black/10 space-y-4">
            <button
              onClick={() => handleAction("deleteAccount")}
              className="text-[9px] text-neutral-400 hover:text-red-600 uppercase tracking-[0.3em] font-bold transition-colors cursor-pointer"
            >
              Delete Account
            </button>
            <div className="w-1 h-1 bg-neutral-200 rounded-full" />
            <p className="text-[8px] text-neutral-300 uppercase tracking-[0.5em] font-bold">PAIRO COLLECTION</p>
          </div>

        </div>
      </div>
    </div>
  );
}
