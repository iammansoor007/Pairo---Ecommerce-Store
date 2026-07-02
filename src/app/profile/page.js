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
      <div className="container mx-auto px-2 sm:px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header - Premium Alignment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-neutral-200 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-full flex items-center justify-center text-xl font-bold uppercase text-black shrink-0">
                {userData.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Account Profile</p>
                <p className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black leading-tight truncate">{userData.name}</p>
                <p className="text-[11px] font-semibold text-neutral-500 tracking-wider mt-0.5 truncate">{userData.email}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-6 py-2.5 bg-black text-white hover:bg-neutral-900 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all w-fit cursor-pointer shrink-0"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-black text-white rounded-lg shadow-sm">
              <p className="text-[9px] text-white/60 uppercase tracking-[0.2em] mb-1 font-bold">Total Spent</p>
              <p className="text-3xl font-black tracking-tight font-mono">
                ${userData.orderHistory?.reduce((acc, o) => acc + o.total, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-6 bg-[#FAF9F6] border border-black/[0.03] rounded-lg shadow-sm">
              <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-1 font-bold">Orders Placed</p>
              <p className="text-3xl font-black tracking-tight font-mono text-black">{userData.orderHistory?.length || 0}</p>
            </div>
          </div>

          <div className="space-y-12">
            
            {/* Section: Profile */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <p className={sectionHeadingClass}>Account Information</p>
                <button 
                  onClick={() => setEditingInfo(!editingInfo)} 
                  className="text-[9px] uppercase tracking-widest text-black font-bold hover:underline underline-offset-4 cursor-pointer"
                >
                  {editingInfo ? "Cancel" : "Edit Info"}
                </button>
              </div>
              
              {editingInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
                    <input 
                      className={inputClass} 
                      value={infoForm.name} 
                      onChange={(e) => setInfoForm({...infoForm, name: e.target.value})}
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                    <input 
                      className={inputClass} 
                      value={infoForm.email} 
                      onChange={(e) => setInfoForm({...infoForm, email: e.target.value})}
                      placeholder="Email"
                    />
                  </div>
                  <button 
                    onClick={() => handleAction("updateInfo", infoForm)}
                    className="md:col-span-2 bg-black text-white py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all cursor-pointer mt-2"
                  >
                    Save Profile
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-[0.2em] mb-1 font-bold">Display Name</p>
                    <p className="text-sm font-bold uppercase tracking-wide text-black">{userData.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-[0.2em] mb-1 font-bold">Primary Email</p>
                    <p className="text-sm font-semibold text-black">{userData.email}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Section: Shipping Addresses */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <p className={sectionHeadingClass}>Saved Addresses</p>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)} 
                  className="bg-black text-white px-4 py-2 rounded-[4px] text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-900 transition-all cursor-pointer"
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
                    className="overflow-hidden mb-6"
                  >
                    <div className="p-5 bg-[#FAF9F6] rounded-lg border border-black/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Recipient Name</label>
                        <input placeholder="Full Name" className={inputClass} value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Street Address</label>
                        <input placeholder="Street" className={inputClass} value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">City</label>
                        <input placeholder="City" className={inputClass} value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Postal / Zip Code</label>
                        <input placeholder="Zip Code" className={inputClass} value={addressForm.zipCode} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.addresses?.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest text-center py-6 font-semibold md:col-span-2">
                    No locations saved yet.
                  </p>
                ) : (
                  userData.addresses.map((addr) => (
                    <div key={addr._id} className="p-5 bg-white border border-neutral-200 rounded-lg flex justify-between items-start shadow-sm">
                      <div>
                        <p className="text-xs font-bold uppercase mb-1.5 text-black">{addr.fullName}</p>
                        <p className="text-[11px] text-neutral-500 uppercase tracking-wider leading-relaxed font-semibold">
                          {addr.street}<br/>
                          {addr.city}, {addr.zipCode}<br/>
                          {addr.country || "United States"}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleAction("deleteAddress", { id: addr._id })} 
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Section: History */}
            <section className="space-y-4">
               <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <p className={sectionHeadingClass}>Recent Order History</p>
               </div>
               
               {userData.orderHistory?.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-neutral-200 rounded-lg">
                     <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                       You haven&apos;t placed any orders yet.
                     </p>
                  </div>
               ) : (
                  <div className="space-y-3">
                    {userData.orderHistory.map((order, i) => (
                      <div key={i} className="p-5 bg-white border border-neutral-200 rounded-lg space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <p className="text-xs font-bold uppercase tracking-tight text-neutral-400">#{order.orderNumber || i+1024}</p>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px] ${
                              order.status === 'Delivered' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 
                              order.status === 'Cancelled' ? 'bg-rose-50 border border-rose-100 text-rose-800' :
                              'bg-neutral-100 border border-neutral-200 text-neutral-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-8 h-10 rounded-[3px] border border-white bg-neutral-100 overflow-hidden shrink-0 shadow-sm relative z-[1]">
                                <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                              </div>
                            ))}
                            {order.items?.length > 3 && (
                              <div className="w-8 h-10 rounded-[3px] border border-white bg-black text-white text-[8px] flex items-center justify-center shadow-sm font-bold relative z-[2]">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right space-y-1">
                            <p className="text-base font-bold text-black font-mono">
                              ${order.total.toLocaleString()}
                            </p>
                            {['Pending', 'Confirmed', 'Processing'].includes(order.status) && (
                              <button 
                                onClick={() => handleAction("cancelOrder", { orderId: order.id })}
                                className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline block ml-auto cursor-pointer"
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
            </section>

            {/* Minimal Actions */}
            <div className="flex flex-col items-center pt-8 border-t border-neutral-200 space-y-4">
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
    </div>
  );
}
