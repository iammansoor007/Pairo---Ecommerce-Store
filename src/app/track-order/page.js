"use client";

import { useState } from "react";
import { 
  Search, 
  ChevronRight, 
  Loader2, 
  Package, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/track-order?email=${email}&orderNumber=${orderNumber}`);
      const data = await res.json();

      if (data.success) {
        // We'll redirect to a special guest view or just the profile view if we make it public with token
        router.push(`/order-tracking/${data.orderId}`);
      } else {
        setError(data.error || "Order not found. Please check your details.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-32">
      <div className="max-w-md w-full space-y-12">
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-black text-white rounded-2xl mx-auto flex items-center justify-center mb-8">
             <Package className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight uppercase">Track Order</h1>
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">Enter your details to retrieve order intelligence</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="email@example.com"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Order Number</label>
              <input 
                type="text" 
                required
                placeholder="PAI-1001"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
           </div>

           {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}

           <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50"
           >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Track Order <ChevronRight className="w-4 h-4" /></>}
           </button>
        </form>

        <div className="text-center">
           <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-black/20 hover:text-black transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Return to Home
           </Link>
        </div>

      </div>
    </div>
  );
}
