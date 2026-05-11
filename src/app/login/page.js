"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold heading-font uppercase tracking-tight text-black">Sign In</h1>
          <p className="mt-3 text-black/50 text-sm">Welcome back. Enter your credentials to access your account.</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold p-4 rounded-xl text-center uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-1">Email</label>
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
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-black/20 hover:text-black uppercase tracking-widest">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                className="block w-full px-4 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-black outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-black/40">
              New to Pairo?{" "}
              <Link href="/signup" className="text-black font-bold hover:underline underline-offset-4">Create account</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
