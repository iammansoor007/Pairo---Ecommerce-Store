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
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold heading-font uppercase tracking-tight text-black">Create Account</h1>
          <p className="mt-3 text-black/50 text-sm">Join Pairo. Save your orders and preferences in one place.</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold p-4 rounded-xl text-center uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Full Name</label>
              <input
                type="text"
                required
                className="block w-full px-4 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Email Address</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-black/40">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-bold hover:underline underline-offset-4">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
