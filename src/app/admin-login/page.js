"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid credentials. Please check your admin access.");
      } else {
        // We'll check the session role in the next step, but for now redirect to admin
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[320px] space-y-6">
        {/* WP-style Logo Header */}
        <div className="text-center mb-8">
           <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <div className="w-20 h-20 bg-white border border-black/5 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <span className="text-4xl font-black italic tracking-tighter">P.</span>
              </div>
           </Link>
           <h1 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#1d2327]">Pairo Core Console</h1>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-[#dcdcde] shadow-sm p-8 rounded-sm">
           {error && (
             <div className="mb-6 p-4 bg-white border-l-4 border-[#d63638] shadow-sm animate-in fade-in slide-in-from-left-2">
                <p className="text-[12px] text-[#1d2327] font-medium leading-relaxed">
                   <strong>Error:</strong> {error}
                </p>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wide">Username or Email Address</label>
                 <input 
                   type="email"
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none p-3 text-[14px] transition-all"
                 />
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wide">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-bold text-[#2271b1] hover:text-[#135e96] uppercase tracking-widest"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                 </div>
                 <input 
                   type={showPassword ? "text" : "password"}
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none p-3 text-[14px] transition-all"
                 />
              </div>

              <div className="flex items-center gap-3 py-2">
                 <input type="checkbox" id="remember" className="w-4 h-4 border-[#8c8f94] rounded-sm" />
                 <label htmlFor="remember" className="text-[12px] text-[#1d2327] font-medium">Remember Me</label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2271b1] hover:bg-[#135e96] border-[#135e96] text-white py-3 rounded-sm text-[13px] font-bold shadow-[0_1px_0_#135e96] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
           </form>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col items-start gap-4 px-2">
           <Link href="/forgot-password" title="Lost your password?" className="text-[12px] text-[#2271b1] hover:text-[#135e96]">Lost your password?</Link>
           <Link href="/" className="text-[12px] text-[#2271b1] hover:text-[#135e96] flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Go to Pairo Store
           </Link>
        </div>
      </div>
    </div>
  );
}
