"use client";

import React, { useState } from "react";
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
  ChevronDown,
  ExternalLink,
  LogOut,
  FileText,
  ShoppingCart,
  Plus,
  BarChart3,
  Box
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // State for submenus
  const [openMenus, setOpenMenus] = useState({
     posts: pathname.includes("/admin/blogs"),
     woo: pathname.includes("/admin/orders") || 
          pathname.includes("/admin/discounts") || 
          pathname.includes("/admin/products") || 
          pathname.includes("/admin/analytics") ||
          (pathname.includes("/admin/categories") && !pathname.includes("/admin/blogs"))
  });

  const toggleMenu = (menu) => {
     setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const NavLink = ({ href, icon: Icon, children, exact = false }) => {
     const isActive = exact ? pathname === href : pathname.startsWith(href);
     return (
        <Link 
          href={href}
          className={`flex items-center gap-2 px-3 py-1.5 text-[14px] leading-[1.3] transition-all group ${
            isActive 
              ? "text-white font-medium bg-[#353c42]" 
              : "text-[#a7aaad] hover:text-[#72aee6]"
          }`}
        >
          {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#a7aaad] group-hover:text-[#72aee6]"}`} />}
          <span className={isActive ? "ml-1" : ""}>{children}</span>
        </Link>
     );
  };

  return (
    <aside className="w-[160px] bg-[#1d2327] text-[#f0f0f1] min-h-screen flex flex-col fixed left-0 top-0 z-50 font-sans border-r border-white/5 select-none">
      {/* WP-Style Header */}
      <div className="mb-2 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2 px-3 py-4 hover:text-[#72aee6] transition-colors">
           <div className="w-5 h-5 bg-[#2271b1] rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-black italic text-white">P</span>
           </div>
           <span className="text-[14px] font-bold">Pairo Store</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-1 py-2">
           
           {/* Dashboard */}
           <Link href="/admin" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin" ? "bg-[#2271b1] text-white" : "hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
           </Link>

           {/* Blog Dropdown */}
           <div className="group">
              <button 
                onClick={() => toggleMenu("posts")}
                className={`w-full flex items-center justify-between px-3 py-2 text-[14px] transition-all ${openMenus.posts ? "bg-[#2271b1] text-white" : "hover:bg-[#2c3338] hover:text-[#72aee6]"}`}
              >
                 <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Blog</span>
                 </div>
                 {openMenus.posts ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {openMenus.posts && (
                 <div className="bg-[#2c3338] py-1">
                    <NavLink href="/admin/blogs" exact>All Posts</NavLink>
                    <NavLink href="/admin/blogs/new">Add New</NavLink>
                    <NavLink href="/admin/blogs/categories">Categories</NavLink>
                 </div>
              )}
           </div>

           {/* Media */}
           <Link href="/admin/media" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/media" ? "bg-[#2271b1] text-white" : "hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
              <ImageIcon className="w-4 h-4" />
              <span>Media</span>
           </Link>

           <div className="h-[1px] bg-white/5 my-2 mx-3" />

           {/* WooCommerce Dropdown */}
           <div className="group">
              <button 
                onClick={() => toggleMenu("woo")}
                className={`w-full flex items-center justify-between px-3 py-2 text-[14px] transition-all ${openMenus.woo ? "bg-[#2271b1] text-white" : "hover:bg-[#2c3338] hover:text-[#72aee6]"}`}
              >
                 <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>WooCommerce</span>
                 </div>
                 {openMenus.woo ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {openMenus.woo && (
                 <div className="bg-[#2c3338] py-1 border-l-[3px] border-[#2271b1]/30">
                    <NavLink href="/admin/orders" icon={ShoppingBag}>Orders</NavLink>
                    <NavLink href="/admin/customers" icon={Users}>Customers</NavLink>
                    <NavLink href="/admin/promotions" icon={Tag}>Discounts & Coupons</NavLink>
                    <NavLink href="/admin/analytics" icon={BarChart3}>Analytics</NavLink>
                    
                    {/* Products grouped inside Woo */}
                    <div className="px-3 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-2 mb-1">Products</div>
                    <NavLink href="/admin/products" exact icon={Box}>All Products</NavLink>
                    <NavLink href="/admin/products/new" icon={Plus}>Add New</NavLink>
                    <NavLink href="/admin/categories" icon={Layers}>Categories</NavLink>
                    
                    <div className="h-[1px] bg-white/5 my-1" />
                    <NavLink href="/admin/settings" icon={Settings}>Settings</NavLink>
                 </div>
              )}
           </div>

           <div className="h-[1px] bg-white/5 my-2 mx-3" />

           {/* Submissions */}
           <Link href="/admin/contact" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/contact" ? "bg-[#2271b1] text-white" : "hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
              <Mail className="w-4 h-4" />
              <span>Submissions</span>
           </Link>

        </div>
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
