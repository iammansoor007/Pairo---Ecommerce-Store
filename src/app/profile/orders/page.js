"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  ChevronRight, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/profile/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 className="w-3.5 h-3.5 text-black" />;
      case 'Shipped': return <Truck className="w-3.5 h-3.5 text-neutral-500" />;
      case 'Cancelled': return <Clock className="w-3.5 h-3.5 text-neutral-400" />;
      default: return <Package className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 pt-20 pb-12">
        <div className="w-full mx-auto space-y-12">
          
          <div className="flex items-center justify-between border-b border-black/10 pb-8">
            <div className="space-y-1">
              <h1 className="text-[24px] font-bold uppercase tracking-[0.1em] text-black">My Orders</h1>
              <p className="text-[10px] font-bold text-black/80 uppercase tracking-[0.2em]">Track your acquisitions and history</p>
            </div>
            <Link 
              href="/profile" 
              className="text-[9px] font-black uppercase tracking-widest text-black hover:opacity-75 transition-opacity flex items-center gap-1.5 border border-black/10 px-4 py-2 rounded-[4px] bg-[#FAF9F6] shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          <div className="space-y-8">
            {loading ? (
               Array(3).fill(0).map((_, i) => (
                 <div key={i} className="h-32 bg-[#FAF9F6] border border-black/[0.04] rounded-[4px] animate-pulse" />
               ))
            ) : orders.length === 0 ? (
               <div className="text-center py-20 bg-[#FAF9F6] border border-black/[0.04] rounded-[4px] space-y-6">
                  <ShoppingBag className="w-12 h-12 text-black/10 mx-auto" />
                  <div className="space-y-2">
                     <p className="text-xs font-black uppercase tracking-[0.2em]">No orders yet</p>
                     <p className="text-[11px] text-black/80 font-bold uppercase tracking-wider">You haven&apos;t made any acquisitions yet.</p>
                  </div>
                  <Link href="/shop" className="inline-block bg-black text-white px-8 py-3.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-sm">
                     Start Shopping
                  </Link>
               </div>
            ) : (
               orders.map((order, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order._id}
                    className="bg-white border border-black/[0.06] rounded-[4px] p-6 hover:border-black/15 transition-all shadow-sm space-y-6"
                 >
                    {/* Card Header: Order Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/[0.04]">
                       <div className="flex items-center gap-4">
                          <div>
                             <p className="text-[9px] font-bold text-black/70 uppercase tracking-widest">Order Number</p>
                             <p className="text-xs font-black text-black font-mono mt-0.5">{order.orderNumber}</p>
                          </div>
                          <div className="h-6 w-[1px] bg-black/10" />
                          <div>
                             <p className="text-[9px] font-bold text-black/70 uppercase tracking-widest">Acquired On</p>
                             <p className="text-xs font-bold text-black font-mono mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] rounded-[2px] ${order.status === 'Delivered' ? 'bg-black text-white' : 'bg-neutral-100 text-black border border-black/5'}`}>
                             {order.status}
                          </span>
                       </div>
                    </div>

                    {/* Card Body: Items List */}
                    <div className="divide-y divide-black/[0.03]">
                       {order.items.map((item, idx) => (
                         <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center">
                            <div className="w-10 h-14 bg-[#FAF9F6] border border-black/10 rounded-[2px] overflow-hidden shrink-0">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="text-xs font-bold uppercase tracking-wider text-black truncate">{item.name}</h4>
                               <p className="text-[9px] font-bold text-black/70 uppercase mt-0.5">Qty {item.quantity}</p>
                            </div>
                            <div className="text-right shrink-0">
                               <p className="text-xs font-bold text-black font-mono">${item.priceAtPurchase.toLocaleString()}</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Card Footer: Total & Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-black/[0.04]">
                       <div>
                          <p className="text-[9px] font-bold text-black/70 uppercase tracking-widest">Total Amount</p>
                          <p className="text-[15px] font-black text-black font-mono mt-0.5">${order.financials.total.toLocaleString()}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <Link 
                            href={`/profile/orders/${order._id}`}
                            className="bg-black text-white px-5 py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-sm"
                          >
                             View Details
                          </Link>
                       </div>
                    </div>
                 </motion.div>
               ))
            )}
          </div>
 
        </div>
      </div>
    </div>
  );
}
