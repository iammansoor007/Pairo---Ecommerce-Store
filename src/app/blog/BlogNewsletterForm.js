"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function BlogNewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "You're on the list!");
        setEmail("");
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-3 justify-center w-full max-w-md mx-auto">
       <input 
          type="email" 
          required
          placeholder="ENTER YOUR EMAIL" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className="bg-white border border-black/15 text-black px-5 py-3.5 rounded-[4px] w-full text-[10px] font-bold tracking-widest focus:outline-none focus:border-black transition-colors placeholder-black/30 disabled:opacity-50 uppercase"
       />
       <button 
          type="submit"
          disabled={submitting}
          className="bg-black text-white px-8 py-3.5 rounded-[4px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all disabled:opacity-50 whitespace-nowrap"
       >
          {submitting ? "Joining..." : "Join Archive"}
       </button>
    </form>
  );
}
