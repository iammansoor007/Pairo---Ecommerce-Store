"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login");
      } else {
        // Show detailed error if available from backend
        const errorMessage = data.error 
          ? `${data.message}: ${data.error}` 
          : (data.message || "Something went wrong");
        setError(errorMessage);
      }
    } catch (err) {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center pt-32 pb-20 px-6 sm:px-8 font-sans">
      <div className="max-w-md w-full mx-auto bg-[#FAF9F6] border border-black/[0.04] p-8 sm:p-10 rounded-[4px] shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-black">Create Account</h1>
          <p className="mt-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Join Pairo Lifestyle</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 text-[10px] font-bold p-4 rounded-[4px] text-center uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-black/60 px-0.5">Full Name</label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 bg-white border border-black/10 rounded-[4px] text-xs font-semibold text-black placeholder-neutral-300 focus:border-black outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-black/60 px-0.5">Email Address</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 bg-white border border-black/10 rounded-[4px] text-xs font-semibold text-black placeholder-neutral-300 focus:border-black outline-none transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-black/60 px-0.5">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 bg-white border border-black/10 rounded-[4px] text-xs font-semibold text-black placeholder-neutral-300 focus:border-black outline-none transition-all"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-[4px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-900 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>

          <div className="text-center pt-2">
            <p className="text-[11px] text-neutral-500 font-medium tracking-wide">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-black uppercase tracking-wider hover:underline underline-offset-2 ml-1">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
