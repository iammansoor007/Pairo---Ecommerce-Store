"use client";

import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Globe } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Create Account</h1>
          <p className="text-[var(--foreground)]/60">Join Pairo and start shopping</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-[var(--secondary)] rounded-full py-4 pl-12 pr-4 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-[var(--secondary)] rounded-full py-4 pl-12 pr-4 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-[var(--secondary)] rounded-full py-4 pl-12 pr-4 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs text-[var(--foreground)]/60 leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="#" className="font-bold underline">Terms of Service</Link> and{" "}
            <Link href="#" className="font-bold underline">Privacy Policy</Link>.
          </div>

          <button className="w-full bg-black text-white flex items-center justify-center gap-2 py-4 rounded-full font-bold hover:opacity-90 transition-all">
            Sign Up
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="relative flex items-center justify-center">
            <span className="absolute bg-white px-4 text-xs text-[var(--foreground)]/40 uppercase">Or continue with</span>
            <div className="w-full border-t border-[var(--foreground)]/10" />
          </div>

          <button className="w-full border border-[var(--foreground)]/10 flex items-center justify-center gap-3 py-4 rounded-full font-bold hover:bg-[var(--secondary)] transition-all">
            <Globe className="w-5 h-5" />
            Google
          </button>
        </form>

        <p className="text-center text-[var(--foreground)]/60">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
