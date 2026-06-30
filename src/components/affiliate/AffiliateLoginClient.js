"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function AffiliateLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        loginType: "affiliate",
        redirect: false
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Welcome back!");
        window.location.replace("/affiliate/dashboard");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@company.com"
            className="w-full pl-10 pr-4 py-3 rounded-[3px] border border-gray-300 bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none text-[13px] transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Password</label>
          <a href="#" className="text-[10px] text-gray-400 uppercase tracking-wider hover:text-black transition-colors">Forgot?</a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-[3px] border border-gray-300 bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none text-[13px] transition-all"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3.5 rounded-[3px] bg-black text-white text-[12px] uppercase tracking-widest font-bold hover:bg-neutral-900 active:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            Signing in...
          </>
        ) : (
          <>
            <span>Login to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="text-center pt-4 border-t border-gray-100 mt-6">
        <p className="text-[11px] text-gray-400 font-light">
          Want to join the partner program?{" "}
          <a href="/become-an-affiliate" className="font-bold text-black underline uppercase tracking-wider hover:text-neutral-700 ml-1">
            Apply Now
          </a>
        </p>
      </div>
    </form>
  );
}
