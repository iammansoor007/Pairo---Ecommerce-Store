"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Tag, 
  Image as ImageIcon, 
  Mail, 
  Settings, 
  Trash2,
  ChevronRight,
  ExternalLink,
  LogOut
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "Discounts", href: "/admin/discounts", icon: Tag },
  { name: "Submissions", href: "/admin/contact", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-[160px] bg-[#1d2327] text-[#f0f0f1] min-h-screen flex flex-col fixed left-0 top-0 z-50 font-sans border-r border-white/5">
      {/* WP-Style Header - Dashboard Link */}
      <div className="mb-2 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2 px-3 py-4 hover:text-[#72aee6] transition-colors">
           <div className="w-5 h-5 bg-[#2271b1] rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-black italic text-white">P</span>
           </div>
           <span className="text-[14px] font-bold">Pairo Store</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-3 py-3 mb-2 border-b border-white/5">
         <p className="text-[13px] font-bold text-white truncate">{session?.user?.name || "Admin"}</p>
      </div>

      {/* Menu List */}
      <nav className="flex-1">
        <ul className="space-y-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-[14px] leading-[1.3] transition-all group ${
                    isActive 
                      ? "bg-[#2271b1] text-white border-l-[3px] border-white" 
                      : "hover:bg-[#2c3338] hover:text-[#72aee6] border-l-[3px] border-transparent"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#a7aaad] group-hover:text-[#72aee6]"}`} />
                  <span className="block">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-[#72aee6] hover:text-white transition-colors text-[13px] font-medium"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
