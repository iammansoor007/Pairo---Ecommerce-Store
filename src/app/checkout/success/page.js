"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Calendar, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const orderNumber = "PAI-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white flex items-center justify-center py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full text-center space-y-12"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.3, type: "spring", damping: 12 }}
            className="w-24 h-24 bg-black rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold heading-font tracking-tighter uppercase leading-none">Thank You</h1>
          <p className="text-black/40 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Your order has been received and is being processed.</p>
        </div>

        <div className="bg-[#f9f9f9] rounded-[40px] p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left border border-black/5">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-black/5 rounded-xl"><Package className="w-5 h-5" /></div>
                 <div>
                    <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Order Number</p>
                    <p className="text-sm font-bold tracking-tight">#{orderNumber}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-black/5 rounded-xl"><Calendar className="w-5 h-5" /></div>
                 <div>
                    <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Order Date</p>
                    <p className="text-sm font-bold tracking-tight">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                 </div>
              </div>
           </div>
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-black/5 rounded-xl"><Mail className="w-5 h-5" /></div>
                 <div>
                    <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Confirmation</p>
                    <p className="text-sm font-bold tracking-tight">Sent to your email</p>
                 </div>
              </div>
              <div className="p-4 bg-black text-white rounded-2xl">
                 <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">Standard Shipping</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest">Delivery in 5-7 Days</p>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
           <Link href="/shop" className="group relative overflow-hidden bg-black text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95">
              <span className="relative z-10 flex items-center gap-2">Continue Shopping <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
              <div className="absolute inset-0 bg-[#C19A6B] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
           </Link>
           <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors border-b border-black/10 hover:border-black pb-1">
              Return Home
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
