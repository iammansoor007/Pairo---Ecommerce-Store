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
  Info
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function OrderTrackingDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order-tracking/${id}`); 
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

  if (loading) return <div className="p-20 text-center font-bold text-sm tracking-widest uppercase animate-pulse">Retrieving Order Details...</div>;
  if (!order) return <div className="p-20 text-center font-bold text-sm text-red-500 uppercase tracking-widest">Order not found.</div>;

  return (
    <div className="bg-white min-h-screen text-black pb-32">
      <div className="container mx-auto px-6 md:px-16 pt-32 pb-20 max-w-6xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
             <Link href="/track-order" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-all group">
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Tracking
             </Link>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">{order.orderNumber}</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-black text-white'}`}>
                {order.status}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           
           {/* Left: Items & Summary */}
           <div className="lg:col-span-7 space-y-12">
              <section className="space-y-8">
                 <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black/30">Acquired Pieces</h2>
                 <div className="space-y-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-8 group">
                         <div className="w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden border shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest">{item.name}</h3>
                            <p className="text-[10px] font-bold text-black/40 uppercase">{item.selectedVariant?.title} • Qty {item.quantity}</p>
                            <p className="text-lg font-bold tracking-tight mt-2">${item.priceAtPurchase.toLocaleString()}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="pt-12 border-t border-black/5 space-y-6">
                 <div className="flex justify-between items-baseline text-black/40">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold">${order.financials.subtotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-baseline text-black/40">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Shipping</span>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Complimentary</span>
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
              <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-10">
                 <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-black/30">Order Journey</h2>
                 <div className="space-y-8">
                    {order.timeline.filter(e => e.source !== 'Admin' || e.status === order.status).map((event, i) => (
                      <div key={i} className="flex gap-6 relative">
                         <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-black shadow-lg z-10" />
                            {i !== order.timeline.length - 1 && <div className="w-[1px] h-full bg-black/10 absolute top-3" />}
                         </div>
                         <div className="space-y-1 pb-4">
                            <p className="text-xs font-bold uppercase tracking-widest">{event.status}</p>
                            <p className="text-xs text-black/40 leading-relaxed">{event.message}</p>
                            <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest">{new Date(event.timestamp).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Delivery Info */}
              <div className="p-10 border border-black/5 rounded-[2.5rem] space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black/30">
                       <MapPin className="w-4 h-4" /> Destination
                    </div>
                    <p className="text-sm font-bold leading-relaxed">
                       {order.shippingAddress.fullName}<br />
                       {order.shippingAddress.street}<br />
                       {order.shippingAddress.city}, {order.shippingAddress.zip}<br />
                       {order.shippingAddress.country}
                    </p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
