import AffiliateLoginClient from "@/components/affiliate/AffiliateLoginClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Affiliate Portal Login — Pairo Studio",
  description: "Access your Pairo Lifestyle affiliate account. View your dashboard, clicks, conversion metrics, and payout logs.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AffiliateLoginPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen flex flex-col justify-between px-4 py-12 text-black font-sans">
      {/* Top Bar Navigation */}
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Store
        </Link>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Pairo Studio</span>
        </div>
      </div>

      {/* Main Login Card Wrapper */}
      <div className="flex-1 flex items-center justify-center max-w-md w-full mx-auto py-8">
        <div className="w-full space-y-8 p-8 md:p-10 border border-neutral-200 bg-white shadow-md rounded-[3px]">
          {/* Header */}
          <div className="text-center space-y-3">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em]">
              Partner Portal
            </p>
            <h1 className="text-2xl font-normal tracking-tight text-black uppercase">
              Affiliate Log In
            </h1>
            <p className="text-xs text-neutral-500 font-light max-w-xs mx-auto leading-relaxed">
              Log in to manage referral campaigns, download assets, and monitor performance.
            </p>
          </div>

          {/* Form Client */}
          <AffiliateLoginClient />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-6xl w-full mx-auto text-center text-[10px] uppercase tracking-widest text-neutral-400 px-4">
        PAIRO © {new Date().getFullYear()} — Artisanal Heritage • Modern Lifestyle
      </div>
    </div>
  );
}
