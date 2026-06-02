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
  LogOut,
  FileText,
  ShoppingCart,
  Plus,
  BarChart3,
  Box,
  Shield,
  UserPlus,
  History,
  Code2,
  Palette
} from "lucide-react";

import { signOut } from "next-auth/react";
import { useRBAC } from "@/hooks/useRBAC";

const NavLink = ({ href, icon: Icon, children, exact = false, permission, isSubmenu = false }) => {
  const pathname = usePathname();
  const { can } = useRBAC();
  if (permission && !can(permission)) return null;
  
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
     <Link 
       href={href}
       className={`flex items-center gap-2 px-3 py-1.5 text-[14px] leading-[1.3] transition-all group ${
         isActive 
           ? "text-white font-medium bg-[#2271b1]" 
           : isSubmenu ? "text-[#c3c4c7] hover:text-[#72aee6]" : "text-[#a7aaad] hover:text-[#72aee6]"
       } ${isSubmenu ? "py-2 px-4 hover:bg-[#353c42]" : ""}`}
     >
       {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#a7aaad] group-hover:text-[#72aee6]"}`} />}
       <span>{children}</span>
     </Link>
  );
};

const AccordionMenu = ({ title, icon: Icon, children, permission, activePath, isOpen, onToggle }) => {
  const pathname = usePathname();
  const { can } = useRBAC();
  const isActive = pathname.includes(activePath);

  if (permission && !can(permission)) return null;

  return (
      <div className="mb-1">
          <button 
              onClick={onToggle}
              className={`w-full flex items-center justify-between px-3 py-2 text-[14px] transition-all ${isActive ? "bg-[#2271b1] text-white font-medium" : "hover:bg-[#2c3338] hover:text-[#72aee6] text-[#a7aaad]"}`}
          >
              <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                  <span>{title}</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""} opacity-50`} />
          </button>
          
          {/* Accordion Submenu */}
          {isOpen && (
              <div className="bg-[#2c3338] py-1">
                  {children}
              </div>
          )}
      </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="px-3 pt-4 pb-1">
    <span className="text-[11px] font-semibold text-[#a7aaad]/70 uppercase tracking-widest">{title}</span>
  </div>
);

export default function AdminSidebar() {
  const pathname = usePathname();
  const { can } = useRBAC();

  // Find the initially active accordion based on the pathname
  const initialOpen = ['/admin/products', '/admin/orders', '/admin/pages', '/admin/blogs', '/admin/settings/team'].find(path => pathname.includes(path));
  const [openAccordion, setOpenAccordion] = useState(initialOpen || "");

  const handleToggle = (path) => {
    setOpenAccordion(prev => prev === path ? "" : path);
  };

  return (
    <aside className="w-[200px] bg-[#1d2327] text-[#f0f0f1] h-screen flex flex-col fixed left-0 top-0 z-50 font-sans border-r border-white/5 select-none">
      {/* Sidebar Header */}
      <div className="border-b border-white/5 shrink-0 bg-[#1d2327]">
        <Link href="/admin" className="flex items-center gap-2 px-3 py-4 hover:text-[#72aee6] transition-colors">
           <div className="w-6 h-6 bg-[#2271b1] rounded-sm flex items-center justify-center">
              <span className="text-[12px] font-black italic text-white">P</span>
           </div>
           <span className="text-[14px] font-bold tracking-wide">Pairo Store</span>
        </Link>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="py-2">
           
           {/* Dashboard */}
           <div className="mb-1">
             <Link href="/admin" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin" ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
             </Link>
           </div>
           <div className="mb-1">
             <Link href="/admin/analytics" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/analytics" ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
             </Link>
           </div>

           <SectionHeader title="E-Commerce" />

           {/* Products Accordion */}
           <AccordionMenu 
              title="Products" icon={Box} permission="products.view" activePath="/admin/products"
              isOpen={openAccordion === "/admin/products"} onToggle={() => handleToggle("/admin/products")}
           >
                <NavLink href="/admin/products" exact isSubmenu>All Products</NavLink>
                <NavLink href="/admin/products/new" isSubmenu>Add New</NavLink>
                <NavLink href="/admin/categories" isSubmenu>Categories</NavLink>
           </AccordionMenu>

           {/* Store Accordion */}
           <AccordionMenu 
              title="Store" icon={ShoppingCart} permission="orders.view" activePath="/admin/orders"
              isOpen={openAccordion === "/admin/orders"} onToggle={() => handleToggle("/admin/orders")}
           >
                <NavLink href="/admin/orders" isSubmenu>Orders</NavLink>
                <NavLink href="/admin/customers" isSubmenu>Customers</NavLink>
                <NavLink href="/admin/reviews" isSubmenu permission="reviews.view">Reviews</NavLink>
                <NavLink href="/admin/promotions" isSubmenu>Promotions</NavLink>
           </AccordionMenu>

           <SectionHeader title="Content" />

           {/* Page Builder Accordion */}
           <AccordionMenu 
              title="Pages" icon={Layers} permission="pages.view" activePath="/admin/pages"
              isOpen={openAccordion === "/admin/pages"} onToggle={() => handleToggle("/admin/pages")}
           >
                <NavLink href="/admin/pages" exact isSubmenu>All Pages</NavLink>
                <NavLink href="/admin/pages/new" isSubmenu>Add New</NavLink>
           </AccordionMenu>

           {/* Blog Accordion */}
           <AccordionMenu 
              title="Posts" icon={FileText} permission="blogs.view" activePath="/admin/blogs"
              isOpen={openAccordion === "/admin/blogs"} onToggle={() => handleToggle("/admin/blogs")}
           >
                <NavLink href="/admin/blogs" exact isSubmenu>All Posts</NavLink>
                <NavLink href="/admin/blogs/new" isSubmenu>Add New</NavLink>
                <NavLink href="/admin/blogs/categories" isSubmenu>Categories</NavLink>
           </AccordionMenu>

           {/* Media Standalone */}
           {can("media.manage") && (
            <div className="mb-1">
              <Link href="/admin/media" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/media" ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                  <ImageIcon className="w-4 h-4" />
                  <span>Media</span>
              </Link>
            </div>
           )}

           {/* Submissions Standalone */}
           <div className="mb-1">
             <Link href="/admin/contact" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/contact" ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                <Mail className="w-4 h-4" />
                <span>Contact Forms</span>
             </Link>
           </div>

           <SectionHeader title="Settings" />

           {/* Appearance Standalone */}
           {can("settings.view") && (
              <div className="mb-1">
                <Link href="/admin/appearance" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/appearance" ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                   <Palette className="w-4 h-4" />
                   <span>Appearance</span>
                </Link>
              </div>
           )}

           {/* Site Settings Standalone */}
           {can("settings.view") && (
              <div className="mb-1">
                <Link href="/admin/settings/site" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname.startsWith("/admin/settings/site") ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                   <Settings className="w-4 h-4" />
                   <span>Site Settings</span>
                </Link>
              </div>
           )}

           {/* Script Management Standalone */}
           {can("scripts.view") && (
              <div className="mb-1">
                <Link href="/admin/settings/scripts" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname.startsWith("/admin/settings/scripts") ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                   <Code2 className="w-4 h-4" />
                   <span>Custom Scripts</span>
                </Link>
              </div>
           )}

           {/* Users Accordion */}
           <AccordionMenu 
              title="Users & Roles" icon={Users} permission="staff.view" activePath="/admin/settings/team"
              isOpen={openAccordion === "/admin/settings/team"} onToggle={() => handleToggle("/admin/settings/team")}
           >
                <NavLink href="/admin/settings/team" exact isSubmenu>All Staff</NavLink>
                <NavLink href="/admin/settings/team/new" isSubmenu>Invite User</NavLink>
                <NavLink href="/admin/settings/roles" isSubmenu>Roles & Access</NavLink>
           </AccordionMenu>

           {/* Audit Logs Standalone */}
           {can("settings.view") && (
              <div className="mb-1">
                <Link href="/admin/settings/logs" className={`flex items-center gap-2 px-3 py-2 text-[14px] transition-all ${pathname === "/admin/settings/logs" ? "bg-[#2271b1] text-white font-medium" : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6]"}`}>
                   <History className="w-4 h-4" />
                   <span>Audit Logs</span>
                </Link>
              </div>
           )}

        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/5 shrink-0 bg-[#1d2327]">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-[#72aee6] hover:text-white transition-colors text-[13px] font-medium w-full px-2"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </aside>
  );
}
