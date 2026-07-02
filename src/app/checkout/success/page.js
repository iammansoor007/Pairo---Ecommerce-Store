"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Printer, PhoneCall, HelpCircle, Loader2, Calendar, MapPin, CreditCard, ShoppingBag, Truck, Mail, ChevronDown } from "lucide-react";

export default function SuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      const orderNum = params.get("orderNumber");

      if (orderNum) {
        setOrderNumber(orderNum);
      }

      if (id) {
        try {
          const res = await fetch(`/api/order-tracking/${id}`);
          const data = await res.json();
          if (data.success && data.order) {
            setOrder(data.order);
          } else {
            setError("Could not retrieve order details.");
          }
        } catch (err) {
          console.error("Error fetching order:", err);
          setError("Failed to fetch order details.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getEstimatedDelivery = () => {
    if (!order) return "5-7 business days";
    const snapshot = order.shippingSnapshot || {};
    const method = (snapshot.methodName || "").toLowerCase();
    if (method.includes("express") || method.includes("fast")) {
      return "2-3 business days";
    }
    return "5-7 business days";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        <p className="text-[11px] uppercase tracking-widest font-bold text-neutral-500">Loading Order Details...</p>
      </div>
    );
  }

  const customerName = order?.shippingAddress?.fullName || "Valued Customer";

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white">
      
      {/* Printable Area Styling */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            grid-column: span 12 / span 12 !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Brand Header Banner for Desktop & Mobile */}
      <header className="border-b border-neutral-100 bg-white no-print">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-5">
          <Link href="/" className="text-xl font-bold uppercase tracking-[0.15em] text-black">
            PAIRO LIFESTYLE
          </Link>
        </div>
      </header>

      {/* Mobile Top Collapsible Summary Bar */}
      {order && (
        <div className="lg:hidden bg-[#FAF9F6] border-b border-neutral-200 no-print">
          <button 
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full px-4 py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-neutral-500" />
              <span>{showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showMobileSummary ? "rotate-180" : ""}`} />
            </div>
            <span className="font-mono text-sm">${order.financials.total.toLocaleString()}</span>
          </button>
          
          {showMobileSummary && (
            <div className="px-4 pb-6 border-t border-neutral-100 bg-[#FAF9F6]/40 space-y-4 animate-fade-in">
              <div className="divide-y divide-neutral-200/80 pr-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center py-3.5">
                    <div className="relative shrink-0 pr-2 pt-2">
                      <div className="w-14 h-18 bg-white rounded-[4px] border border-neutral-200 overflow-hidden">
                        <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-black uppercase tracking-wide truncate">{item.name}</p>
                      {item.selectedVariant?.title && (
                        <p className="text-[10px] text-neutral-500 font-semibold uppercase">{item.selectedVariant.title}</p>
                      )}
                      <p className="text-[11px] font-bold text-black font-mono mt-0.5">${item.priceAtPurchase.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-[12px] text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-black font-semibold font-mono">${order.financials.subtotal.toLocaleString()}</span>
                </div>
                {order.financials.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-${order.financials.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                {order.financials.affiliateDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Referral Discount</span>
                    <span className="font-mono">-${order.financials.affiliateDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-black font-semibold font-mono">
                    {order.financials.shippingCost === 0 ? "Free" : `$${order.financials.shippingCost.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid Wrapper */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Confirmation Message & Info (7 cols) */}
          <div className="lg:col-span-7 bg-white space-y-8 print-full-width">
            
            {/* Success Status Card */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order #{orderNumber || order?.orderNumber}</p>
                  <h1 className="text-xl font-bold uppercase tracking-wide text-black">Thank you, {customerName}!</h1>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-[4px] p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black">Your Order is Confirmed</p>
                <p className="text-[13px] text-neutral-600 leading-relaxed">
                  We have accepted your order and are preparing it. A confirmation email has been sent.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black shrink-0" />
                    <span>Order Date: <span className="font-semibold text-black">{order ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-black shrink-0" />
                    <span>Delivery Estimate: <span className="font-semibold text-black">{getEstimatedDelivery()}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Details */}
            {order && (
              <div className="border border-neutral-200 rounded-[4px] p-5 space-y-6">
                <p className="text-xs font-bold uppercase tracking-wider text-black pb-3 border-b border-neutral-100">Order Details</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-black shrink-0" /> Shipping Address
                    </h4>
                    <div className="text-[13px] text-neutral-600 space-y-0.5">
                      <p className="font-bold text-black">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      <p>{order.shippingAddress.country}</p>
                      <p className="text-neutral-400 mt-1">{order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-black shrink-0" /> Billing Address
                    </h4>
                    <div className="text-[13px] text-neutral-600 space-y-0.5">
                      <p className="font-bold text-black">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      <p>{order.shippingAddress.country}</p>
                      <p className="text-neutral-400 mt-1">{order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2 md:col-span-2 pt-2 border-t border-neutral-100">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-black shrink-0" /> Payment Information
                    </h4>
                    <div className="text-[13px] text-neutral-600">
                      <p className="font-bold text-black">{order.payment?.method || "Cash on Delivery"}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Payment Status: <span className="font-bold uppercase tracking-wider text-black">{order.payment?.status || "Pending"}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Support & Contact Section */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-[4px] p-5 space-y-3 no-print">
              <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-black" /> Need Assistance?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                If you have any questions about your order, shipping, or returns, feel free to reach out to our team.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs">
                <a href="mailto:support@pairolifestyle.com" className="text-black font-bold hover:underline flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-neutral-400" /> support@pairolifestyle.com
                </a>
                <a href="tel:+923001234567" className="text-black font-bold hover:underline flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-neutral-400" /> +92 300 1234567
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100 no-print">
              <Link
                href="/shop"
                className="bg-black text-white hover:bg-neutral-900 px-6 py-3.5 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              
              <button
                onClick={handlePrint}
                className="border border-neutral-300 hover:border-black text-black px-6 py-3.5 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-white transition-all shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <Link
                href="/profile/orders"
                className="border border-neutral-300 hover:border-black text-black px-6 py-3.5 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center justify-center bg-white transition-all shrink-0"
              >
                <span>Track Order</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary Side Box (5 cols) - Hidden on Mobile, Sticky on Desktop */}
          <div className="hidden lg:block lg:col-span-5 bg-[#FAF9F6] border border-black/[0.04] rounded-2xl p-6 md:p-8 space-y-6 lg:sticky lg:top-28 self-start">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Order Summary</h3>

            {/* Products List */}
            {order?.items && (
              <div className="divide-y divide-neutral-200/80 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center py-3.5 first:pt-0 last:pb-0">
                    <div className="relative shrink-0 pr-2 pt-2">
                      <div className="w-14 h-18 bg-white rounded-[4px] border border-neutral-200 overflow-hidden">
                        <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm z-10">
                        {item.quantity}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <p className="text-[13px] font-bold text-black uppercase tracking-wide truncate">{item.name}</p>
                      {item.selectedVariant?.title && (
                        <p className="text-[10px] text-neutral-500 font-semibold uppercase">
                          {item.selectedVariant.title}
                        </p>
                      )}
                      <p className="text-[11px] font-bold text-black font-mono mt-1">
                        ${item.priceAtPurchase.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Breakdown */}
            {order && (
              <div className="space-y-3 pt-6 border-t border-neutral-200 text-[12px] text-neutral-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-black font-semibold font-mono">${order.financials.subtotal.toLocaleString()}</span>
                </div>
                
                {order.financials.discountTotal > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-${order.financials.discountTotal.toLocaleString()}</span>
                  </div>
                )}

                {order.financials.affiliateDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Referral Discount</span>
                    <span className="font-mono">-${order.financials.affiliateDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span className="text-black font-semibold font-mono">
                    {order.financials.shippingCost === 0 ? "Free" : `$${order.financials.shippingCost.toLocaleString()}`}
                  </span>
                </div>

                <div className="pt-5 flex justify-between items-end border-t border-neutral-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-black">Total Paid</span>
                  <span className="text-2xl font-black text-black font-mono">${order.financials.total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
