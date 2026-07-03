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
      <div className="container mx-auto px-6 md:px-16 pt-20 pb-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="flex items-center justify-between border-b border-black/10 pb-8">
            <div className="space-y-1">
              <h1 className="text-[18px] font-bold uppercase tracking-[0.1em] text-black">My Orders</h1>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Track your acquisitions and history</p>
            </div>
            <Link 
              href="/profile" 
              className="text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5 border border-black/10 px-4 py-2 rounded-[4px] bg-[#FAF9F6] shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          <div className="space-y-6">
            {loading ? (
               Array(3).fill(0).map((_, i) => (
                 <div key={i} className="h-32 bg-[#FAF9F6] border border-black/[0.04] rounded-[4px] animate-pulse" />
               ))
            ) : orders.length === 0 ? (
               <div className="text-center py-20 bg-[#FAF9F6] border border-black/[0.04] rounded-[4px] space-y-6">
                  <ShoppingBag className="w-12 h-12 text-black/10 mx-auto" />
                  <div className="space-y-2">
                     <p className="text-xs font-black uppercase tracking-[0.2em]">No orders yet</p>
                     <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">You haven&apos;t made any acquisitions yet.</p>
                  </div>
                  <Link href="/shop" className="inline-block bg-black text-white px-8 py-3.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-sm">
                     Start Shopping
                  </Link>
               </div>
            ) : (
               orders.map((order) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order._id}
                    className="bg-white border border-black/[0.08] rounded-[4px] p-6 hover:border-black/20 transition-all group shadow-sm"
                 >
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                       <div className="space-y-6 flex-1">
                          <div className="flex items-center gap-4">
                             <div className="px-3 py-1 bg-black text-white text-[9px] font-black tracking-widest rounded-[2px] uppercase">
                                {order.orderNumber}
                             </div>
                             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                                {getStatusIcon(order.status)}
                                {order.status}
                             </div>
                          </div>
 
                          <div className="flex -space-x-3 overflow-hidden">
                             {order.items.slice(0, 4).map((item, i) => (
                               <div key={i} className="relative w-12 h-16 rounded-[2px] overflow-hidden border-2 border-white bg-[#FAF9F6] shadow-sm">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               </div>
                             ))}
                             {order.items.length > 4 && (
                               <div className="relative w-12 h-16 rounded-[2px] bg-black border-2 border-white flex items-center justify-center text-white text-[9px] font-black shadow-sm">
                                  +{order.items.length - 4}
                               </div>
                             )}
                          </div>
                       </div>
 
                       <div className="flex flex-col justify-between items-end text-right">
                          <div className="space-y-0.5">
                             <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Ordered On</p>
                             <p className="text-xs font-bold text-black font-mono">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-0.5 mt-4">
                             <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Total Amount</p>
                             <p className="text-xl font-bold tracking-wide text-black font-mono">${order.financials.total.toLocaleString()}</p>
                          </div>
                          <Link 
                            href={`/profile/orders/${order._id}`}
                            className="mt-6 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-black hover:opacity-75 transition-opacity"
                          >
                             View Details <ChevronRight className="w-3.5 h-3.5" />
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
