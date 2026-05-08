"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, Tag } from "lucide-react";
import siteData from "@/lib/data.json";

export default function CartPage() {
  const { products } = siteData;
  const [cartItems, setCartItems] = useState([
    { ...products.newArrivals[0], quantity: 1, size: "Large", color: "White" },
    { ...products.topSelling[1], quantity: 1, size: "Medium", color: "Black" },
    { ...products.newArrivals[2], quantity: 1, size: "Small", color: "Gray" },
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = subtotal * 0.2; // Mock 20% discount
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl md:text-5xl font-black mb-10 uppercase tracking-tighter border-t border-[var(--foreground)]/10 pt-8">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link href="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-[var(--foreground)]/10 rounded-[20px] p-4 md:p-6">
              {cartItems.map((item, index) => (
                <div key={item.id} className={`flex gap-4 py-6 ${index !== cartItems.length - 1 ? "border-b border-[var(--foreground)]/10" : ""}`}>
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-[var(--secondary)] rounded-[15px] overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg md:text-xl uppercase">{item.name}</h3>
                        <p className="text-sm text-[var(--foreground)]/60">Size: <span className="text-[var(--foreground)]">{item.size}</span></p>
                        <p className="text-sm text-[var(--foreground)]/60">Color: <span className="text-[var(--foreground)]">{item.color}</span></p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:opacity-70">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xl md:text-2xl font-bold">${item.price}</span>
                      <div className="flex items-center bg-[var(--secondary)] rounded-full px-4 py-2 gap-6">
                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:opacity-70">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:opacity-70">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-[var(--foreground)]/10 rounded-[20px] p-6 lg:p-8 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 border-b border-[var(--foreground)]/10 pb-6">
                <div className="flex justify-between text-[var(--foreground)]/60">
                  <span>Subtotal</span>
                  <span className="text-[var(--foreground)] font-bold">${subtotal}</span>
                </div>
                <div className="flex justify-between text-[var(--foreground)]/60">
                  <span>Discount (-20%)</span>
                  <span className="text-red-500 font-bold">-${discount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[var(--foreground)]/60">
                  <span>Delivery Fee</span>
                  <span className="text-[var(--foreground)] font-bold">${deliveryFee}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg md:text-xl font-bold mb-8">
                <span>Total</span>
                <span>${total.toFixed(0)}</span>
              </div>

              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
                  <input
                    type="text"
                    placeholder="Add promo code"
                    className="w-full bg-[var(--secondary)] rounded-full py-3.5 pl-12 pr-4 text-sm focus:outline-none"
                  />
                </div>
                <button className="bg-black text-white px-8 rounded-full font-bold text-sm">
                  Apply
                </button>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-black text-white flex items-center justify-center gap-2 py-4 rounded-full font-bold hover:opacity-90 transition-all"
              >
                Go to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
