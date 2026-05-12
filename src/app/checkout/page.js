"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, CreditCard, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [step, setStep] = useState(1);
  
  const shipping = 0; // Free shipping logic
  const total = cartTotal + shipping;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white">
      <div className="container mx-auto px-6 md:px-16 py-12 md:py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/cart" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-all group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Bag
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold heading-font tracking-tighter uppercase leading-none">Checkout</h1>
          </div>
          <div className="flex items-center gap-6 text-black/20 font-bold text-[10px] uppercase tracking-[0.2em]">
            <span className={step >= 1 ? "text-black" : ""}>Shipping</span>
            <div className="w-8 h-[1px] bg-black/10" />
            <span className={step >= 2 ? "text-black" : ""}>Payment</span>
            <div className="w-8 h-[1px] bg-black/10" />
            <span className={step >= 3 ? "text-black" : ""}>Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Left Column: Form */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-7 space-y-12">
            
            {/* Contact Information */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-lg font-bold uppercase tracking-widest">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">First Name</label>
                  <input type="text" placeholder="John" className="w-full bg-[#f9f9f9] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full bg-[#f9f9f9] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-[#f9f9f9] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-lg font-bold uppercase tracking-widest">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">Street Address</label>
                  <input type="text" placeholder="123 Luxury Lane" className="w-full bg-[#f9f9f9] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">City</label>
                  <input type="text" placeholder="New York" className="w-full bg-[#f9f9f9] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 px-1">Postal Code</label>
                  <input type="text" placeholder="10001" className="w-full bg-[#f9f9f9] border-none rounded-xl px-6 py-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
                </div>
              </div>
            </section>

            {/* Payment (Static Mockup) */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/5 text-black/20 flex items-center justify-center text-xs font-bold">3</div>
                <h2 className="text-lg font-bold uppercase tracking-widest text-black/20">Payment Method</h2>
              </div>
              <div className="p-8 border border-black/5 rounded-[32px] bg-[#fcfcfc] flex items-center justify-between opacity-50">
                 <div className="flex items-center gap-4">
                    <CreditCard className="w-6 h-6 text-black/20" />
                    <span className="text-xs font-bold uppercase tracking-widest text-black/20">Secured with Stripe</span>
                 </div>
                 <Lock className="w-4 h-4 text-black/20" />
              </div>
            </section>

            <button className="w-full group relative overflow-hidden bg-black text-white py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95">
              <span className="relative z-10 flex items-center justify-center gap-3">Proceed to Payment <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
              <div className="absolute inset-0 bg-[#C19A6B] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
            </button>
          </motion.div>

          {/* Right Column: Summary */}
          <motion.aside variants={containerVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="lg:col-span-5">
            <div className="sticky top-32 p-8 md:p-12 bg-black text-white rounded-[40px] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 blur-2xl" />
              
              <h2 className="text-xl font-bold uppercase tracking-widest mb-10 pb-6 border-b border-white/10">Order Summary</h2>
              
              {/* Item List */}
              <div className="space-y-8 mb-12 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                {cart.length > 0 ? cart.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="w-20 h-24 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 relative">
                       <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                       <div className="absolute top-1 right-1 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">x{item.quantity}</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.variation?.title || "Standard Edition"}</p>
                      <span className="text-sm font-bold mt-1">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-white/30 text-center py-10 uppercase tracking-widest border border-dashed border-white/10 rounded-3xl">Your bag is empty</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-4 pt-8 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-bold uppercase tracking-[0.3em]">Total</span>
                  <span className="text-3xl font-bold heading-font">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/10">
                 <div className="flex items-center gap-3 text-white/30">
                    <Truck className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Global Express</span>
                 </div>
                 <div className="flex items-center gap-3 text-white/30">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Lifetime Warranty</span>
                 </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
