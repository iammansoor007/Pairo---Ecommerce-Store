"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Info,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function UserOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/profile/orders/${id}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        alert("Order cancelled successfully.");
        window.location.reload();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/profile/orders/${id}`); // We'll need this API too
        const data = await res.json();
        if (data.success) setOrder(data.order);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-bold text-sm tracking-widest uppercase animate-pulse">Retrieving Order Intelligence...</div>;
  if (!order) return <div className="p-20 text-center font-bold text-sm text-red-500 uppercase tracking-widest">Order not found.</div>;

  const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = steps.indexOf(order.status);

  return (
    <div className="bg-white min-h-screen text-black pb-32">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 pt-20 pb-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-black/10 pb-8">
          <div className="space-y-4">
             <Link 
               href="/profile/orders" 
               className="text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5 border border-black/10 px-4 py-2 rounded-[4px] bg-[#FAF9F6] shadow-sm w-fit"
             >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to History
             </Link>
             <h1 className="text-[24px] font-bold uppercase tracking-[0.1em] text-black">{order.orderNumber}</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-[2px] ${order.status === 'Delivered' ? 'bg-black text-white' : 'bg-neutral-100 text-black border border-black/5'}`}>
                {order.status}
             </span>
             {['Pending', 'Confirmed'].includes(order.status) && (
               <button 
                onClick={handleCancel}
                disabled={cancelling}
                className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
               >
                 {cancelling ? "Cancelling..." : "Cancel Order"}
               </button>
             )}
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="bg-[#FAF9F6] border border-black/[0.05] rounded-[4px] p-6 mb-12">
          {/* Active status label for mobile */}
          <div className="text-center mb-5 sm:hidden">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-3 py-1.5 rounded-[2px] shadow-sm">
              Status: {order.status}
            </span>
          </div>

          <div className="relative px-3">
            {/* Connector Line */}
            <div className="absolute left-3 right-3 top-[12px] -translate-y-1/2 h-[2px] bg-black/10 -z-0" />
            <div 
              className="absolute left-3 top-[12px] -translate-y-1/2 h-[2px] bg-black transition-all duration-500" 
              style={{ width: `calc(${currentStep >= 0 ? (currentStep / 4) * 100 : 0}% - 6px)` }}
            />

            <div className="flex justify-between items-start relative z-10">
              {steps.map((step, idx) => {
                const active = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      isCurrent ? 'bg-black text-white border-black scale-110 shadow-md' :
                      active ? 'bg-black text-white border-black' :
                      'bg-white text-black/60 border-black/25'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`hidden sm:inline-block text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mt-2.5 transition-colors ${
                      active ? 'text-black font-black' : 'text-black/60'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
           
           {/* Left: Items & Summary */}
           <div className="lg:col-span-7 space-y-12">
              <section className="space-y-8">
                 <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black/85">Acquired Pieces</h2>
                 <div className="space-y-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 group items-start sm:items-center">
                         <div className="w-16 h-20 bg-[#FAF9F6] rounded-[4px] overflow-hidden border border-black/10 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-center gap-1">
                            <h3 className="text-xs font-black uppercase tracking-wider text-black">{item.name}</h3>
                            <div className="flex flex-col gap-0.5">
                               <p className="text-[9px] font-bold text-black/85 uppercase">Qty {item.quantity}</p>
                               {item.selectedVariant?.options && Object.entries(item.selectedVariant.options).map(([key, val]) => (
                                 <p key={key} className="text-[9px] font-bold text-black uppercase">{key}: {val}</p>
                               ))}
                            </div>
                            <p className="text-sm font-bold tracking-tight mt-1 text-black font-mono">${item.priceAtPurchase.toLocaleString()}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="pt-12 border-t border-black/5 space-y-6">
                 <div className="flex justify-between items-baseline text-black/85">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold text-black">${order.financials.subtotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-baseline text-black/85">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Shipping</span>
                    <span className="text-[10px] font-bold text-black uppercase tracking-widest">Complimentary</span>
                 </div>
                 <div className="flex justify-between items-end pt-8 border-t border-black/5">
                    <span className="text-xs font-bold uppercase tracking-[0.3em]">Total Balance</span>
                    <span className="text-4xl font-bold tracking-tighter">${order.financials.total.toLocaleString()}</span>
                 </div>
              </section>
           </div>

           {/* Right: Timeline & Info */}
           <div className="lg:col-span-5 space-y-8">
              {/* Timeline */}
              <div className="bg-[#FAF9F6] border border-black/[0.06] rounded-[4px] p-6 sm:p-8 space-y-8">
                 <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black/85">Order Journey</h2>
                 <div className="space-y-8">
                    {(() => {
                      const filtered = order.timeline?.filter(e => e.source !== 'Admin' || e.status === order.status) || [];
                      const timelineEvents = filtered.length > 0 ? filtered : [{
                        status: order.status,
                        message: order.status === 'Pending' 
                          ? 'Order placed successfully. Pending confirmation.' 
                          : `Order is currently in ${order.status.toLowerCase()} status.`,
                        timestamp: order.createdAt || new Date(),
                        source: 'System'
                      }];
                      return timelineEvents.map((event, i) => (
                        <div key={i} className="flex gap-4 sm:gap-6 relative">
                           <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-black shadow-lg z-10" />
                              {i !== timelineEvents.length - 1 && <div className="w-[1px] h-full bg-black/10 absolute top-3" />}
                           </div>
                           <div className="space-y-1 pb-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-black">{event.status}</p>
                              <p className="text-xs text-black leading-relaxed">{event.message}</p>
                              <p className="text-[9px] font-bold text-black/85 uppercase tracking-widest">{new Date(event.timestamp).toLocaleDateString()}</p>
                           </div>
                        </div>
                      ));
                    })()}
                 </div>
              </div>

              {/* Delivery Info */}
              <div className="p-6 sm:p-8 border border-black/[0.06] rounded-[4px] bg-white space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black/85">
                       <MapPin className="w-4 h-4" /> Destination
                    </div>
                    <p className="text-sm font-bold leading-relaxed">
                       {order.shippingAddress.fullName}<br />
                       {order.shippingAddress.street}<br />
                       {order.shippingAddress.city}, {order.shippingAddress.zip}<br />
                       {order.shippingAddress.country}
                    </p>
                 </div>

                 <div className="pt-8 border-t border-black/5 space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black/85">
                       <Info className="w-4 h-4" /> Notice
                    </div>
                    <p className="text-[10px] leading-relaxed text-black font-semibold italic">
                       Each piece is meticulously inspected by our master craftsmen before dispatch. 
                    </p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
