"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CreditCard, Truck, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 md:gap-8 mb-12 overflow-x-auto whitespace-nowrap pb-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-black font-bold" : "text-gray-400"}`}>
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-current">1</span>
          <span>Address</span>
        </div>
        <div className="w-12 h-[2px] bg-gray-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-black font-bold" : "text-gray-400"}`}>
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-current">2</span>
          <span>Shipping</span>
        </div>
        <div className="w-12 h-[2px] bg-gray-200" />
        <div className={`flex items-center gap-2 ${step >= 3 ? "text-black font-bold" : "text-gray-400"}`}>
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center border-current">3</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-tighter">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            {/* Shipping Address */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Truck className="w-6 h-6" />
                <h2>Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
                <input type="text" placeholder="Last Name" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
                <input type="email" placeholder="Email Address" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none md:col-span-2" />
                <input type="text" placeholder="Street Address" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none md:col-span-2" />
                <input type="text" placeholder="City" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
                <input type="text" placeholder="Postal Code" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
              </div>
            </section>

            {/* Payment Method */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xl font-bold">
                <CreditCard className="w-6 h-6" />
                <h2>Payment Method</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border-2 border-black rounded-[12px] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-4 border-black" />
                    <span className="font-bold">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-gray-200 rounded" />
                    <div className="w-8 h-5 bg-gray-200 rounded" />
                  </div>
                </label>
                <label className="flex items-center justify-between p-4 border border-[var(--foreground)]/10 rounded-[12px] cursor-pointer opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border" />
                    <span className="font-bold">PayPal</span>
                  </div>
                  <div className="w-8 h-5 bg-gray-200 rounded" />
                </label>
              </div>
              
              <div className="pt-4 space-y-4">
                <input type="text" placeholder="Card Number" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM / YY" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
                  <input type="text" placeholder="CVV" className="w-full bg-[var(--secondary)] rounded-[12px] p-4 focus:outline-none" />
                </div>
              </div>
            </section>

            <button className="w-full bg-black text-white py-5 rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Pay Now
              <ShieldCheck className="w-6 h-6" />
            </button>
          </div>

          {/* Order Brief */}
          <div className="md:col-span-1">
            <div className="bg-[var(--secondary)] rounded-[20px] p-6 space-y-6">
              <h3 className="font-bold text-xl">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Items (3)</span>
                  <span className="font-bold">$540</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Shipping</span>
                  <span className="font-bold">$15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]/60">Tax</span>
                  <span className="font-bold">$43.20</span>
                </div>
                <div className="pt-4 border-t border-[var(--foreground)]/10 flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span>$598.20</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/60 bg-white/50 p-3 rounded-[10px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
