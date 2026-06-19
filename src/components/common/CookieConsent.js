"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Shield } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("pairo_cookie_consent");
    if (!consent) {
      // Small delay for natural slide-in feeling
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("pairo_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("pairo_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-[#1e1e24]/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white font-sans flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
              <Cookie className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold tracking-tight text-white flex items-center gap-1.5">
                Cookie Settings <Shield className="w-4 h-4 text-emerald-400" />
              </h4>
              <p className="text-[11px] text-gray-400">We care about your privacy</p>
            </div>
          </div>
          <button 
            onClick={handleDecline}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-[13px] text-gray-300 leading-relaxed font-light">
          We use cookies to improve your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking <span className="font-semibold text-white">"Accept All"</span>, you consent to our use of cookies.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 rounded-xl text-[12px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/5 hover:border-white/15"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2.5 rounded-xl text-[12px] font-semibold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 shadow-md font-bold"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
