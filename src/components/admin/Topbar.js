"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Bell, Search, LogOut, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdminTopbar() {
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-8 bg-[#1d2327] sticky top-0 z-[100] flex items-center justify-between px-3 text-[#f0f0f1] font-sans">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:text-[#72aee6] transition-colors group px-2 py-1">
          <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center">
            <span className="text-[8px] font-black italic">P</span>
          </div>
          <span className="text-[13px] font-medium hidden sm:block">Pairo</span>
        </Link>

        <div className="hidden md:flex items-center gap-4 text-[13px] font-medium">
          <button className="flex items-center gap-1 hover:text-[#72aee6] transition-colors px-2 py-1">
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
      </div>

      <div className="flex items-center gap-0">
        <div className="relative h-8 flex items-center">
          <button
            onMouseEnter={() => setShowProfile(true)}
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center gap-2 px-3 h-full hover:bg-[#2c3338] transition-all ${showProfile ? 'bg-[#2c3338]' : ''}`}
          >
            <span className="text-[13px] text-[#f0f0f1]">Howdy, <span className="font-bold">{session?.user?.name || "Admin"}</span></span>
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-[#a7aaad]" />
            </div>
          </button>

          {showProfile && (
            <div
              onMouseLeave={() => setShowProfile(false)}
              className="absolute top-full right-0 w-48 bg-[#2c3338] border border-transparent shadow-xl py-1 z-[101] text-[13px]"
            >
              <div className="px-4 py-3 bg-[#2c3338] border-b border-white/5 mb-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#a7aaad]" />
                  </div>
                  <span className="font-bold text-white truncate">{session?.user?.name}</span>
                </div>
                <p className="text-[#a7aaad] text-[11px] truncate">{session?.user?.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-[#72aee6] hover:text-[#f0f0f1] transition-colors">Edit Profile</button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-4 py-2 text-[#72aee6] hover:text-[#f0f0f1] transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
