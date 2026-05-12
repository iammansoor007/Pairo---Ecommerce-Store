"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, CreditCard, Truck, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const shipping = 0; 
  const total = cartTotal + shipping;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate a payment delay
    setTimeout(() => {
      clearCart();
      router.push("/checkout/success");
    }, 2500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white pb-20">
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
            <span className="text-black">Information</span>
            <div className="w-8 h-[1px] bg-black/10" />
            <span className="opacity-50">Payment</span>
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

            {/* Payment Method Selection */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">3</div>
                <h2 className="text-lg font-bold uppercase tracking-widest">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <div className="p-6 border-2 border-black rounded-2xl bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <CreditCard className="w-5 h-5" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Credit / Debit Card</span>
                    </div>
                    <div className="w-4 h-4 rounded-full border-4 border-black" />
                 </div>
                 <div className="p-6 border border-black/5 rounded-2xl bg-[#fcfcfc] flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold uppercase tracking-widest">PayPal</span>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-black/20" />
                 </div>
              </div>
            </section>

            <button 
              onClick={handlePayment}
              disabled={isProcessing || cart.length === 0}
              className="w-full group relative overflow-hidden bg-black text-white py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isProcessing ? (
                  <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                ) : (
                  <>Complete Purchase <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                )}
              </span>
              <div className="absolute inset-0 bg-[#C19A6B] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
            </button>

            <p className="text-[9px] text-center text-black/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Secure SSL Encrypted Checkout
            </p>
          </motion.div>

          {/* Right Column: Summary */}
          <motion.aside variants={containerVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="lg:col-span-5">
            <div className="sticky top-32 p-8 md:p-12 bg-[#0a0a0a] text-white rounded-[40px] shadow-3xl overflow-hidden">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-10 pb-6 border-b border-white/10">Summary</h2>
              
              <div className="space-y-6 mb-12 max-h-[350px] overflow-y-auto scrollbar-hide">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="w-16 h-20 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 relative">
                       <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{item.name}</h3>
                      <p className="text-[9px] text-white/30 uppercase">QTY: {item.quantity}</p>
                      <span className="text-xs font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>Shipping</span>
                  <span className="text-green-400 font-bold">Calculated at next step</span>
                </div>
                <div className="flex justify-between items-end pt-6">
                  <span className="text-xs font-bold uppercase tracking-[0.3em]">Total</span>
                  <span className="text-3xl font-bold heading-font tracking-tighter">${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded-2xl flex items-start gap-4">
                 <Truck className="w-5 h-5 text-white/40 mt-1" />
                 <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">
                    Standard shipping takes 5-7 business days. Priority shipping available for select regions.
                 </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
