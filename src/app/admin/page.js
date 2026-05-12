"use client";

import { useSession } from "next-auth/react";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  Layers, 
  Plus, 
  ImageIcon, 
  Zap,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-5 font-sans">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-normal text-[#1d2327]">Dashboard</h1>
      </div>

      {/* Welcome Panel */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        <div className="p-8">
          <h2 className="text-2xl font-light mb-4 text-[#1d2327]">Welcome to Pairo Core</h2>
          <p className="text-[#3c434a] text-[16px] mb-8">We’ve assembled some links to get you started:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div>
                <h3 className="text-[19px] font-medium mb-4">Get Started</h3>
                <Link href="/admin/products" className="bg-[#2271b1] text-white px-6 py-2.5 rounded-sm font-medium hover:bg-[#135e96] transition-all inline-block mb-6 text-[14px]">Manage Your Products</Link>
                <p className="text-[14px] text-[#3c434a]">or, <Link href="/" className="text-[#2271b1] hover:text-[#135e96]">visit your storefront</Link></p>
             </div>
             <div>
                <h3 className="text-[19px] font-medium mb-4 text-[#1d2327]">Next Steps</h3>
                <ul className="space-y-3 text-[14px] text-[#2271b1]">
                   <li><Link href="/admin/categories" className="hover:text-[#135e96] flex items-center gap-3"><Layers className="w-4 h-4 text-[#8c8f94]" /> Manage Categories</Link></li>
                   <li><Link href="/admin/orders" className="hover:text-[#135e96] flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-[#8c8f94]" /> View Orders</Link></li>
                   <li><Link href="/admin/media" className="hover:text-[#135e96] flex items-center gap-3"><ImageIcon className="w-4 h-4 text-[#8c8f94]" /> Manage Media Library</Link></li>
                </ul>
             </div>
             <div>
                <h3 className="text-[19px] font-medium mb-4 text-[#1d2327]">More Actions</h3>
                <ul className="space-y-3 text-[14px] text-[#2271b1]">
                   <li><Link href="/admin/discounts" className="hover:text-[#135e96] flex items-center gap-3"><Zap className="w-4 h-4 text-[#8c8f94]" /> Manage Discounts</Link></li>
                   <li><Link href="/admin/users" className="hover:text-[#135e96] flex items-center gap-3"><Users className="w-4 h-4 text-[#8c8f94]" /> Manage Users</Link></li>
                </ul>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
         {/* At a Glance */}
         <div className="bg-white border border-[#c3c4c7] shadow-sm">
            <div className="px-4 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
               <h3 className="text-[14px] font-bold text-[#1d2327]">At a Glance</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-y-3 text-[13px]">
               <div className="flex items-center gap-2 text-[#3c434a]"><Package className="w-4 h-4 text-[#8c8f94]" /> <Link href="/admin/products" className="text-[#2271b1] hover:text-[#135e96]">24 Products</Link></div>
               <div className="flex items-center gap-2 text-[#3c434a]"><Layers className="w-4 h-4 text-[#8c8f94]" /> <Link href="/admin/categories" className="text-[#2271b1] hover:text-[#135e96]">12 Categories</Link></div>
               <div className="flex items-center gap-2 text-[#3c434a]"><Users className="w-4 h-4 text-[#8c8f94]" /> <Link href="/admin/users" className="text-[#2271b1] hover:text-[#135e96]">156 Customers</Link></div>
               <div className="flex items-center gap-2 text-[#3c434a]"><ShoppingBag className="w-4 h-4 text-[#8c8f94]" /> <Link href="/admin/orders" className="text-[#2271b1] hover:text-[#135e96]">89 Orders</Link></div>
               <div className="col-span-2 pt-2 text-[#3c434a]">Pairo 2.1 running Modern Theme.</div>
            </div>
         </div>

         {/* Activity */}
         <div className="bg-white border border-[#c3c4c7] shadow-sm">
            <div className="px-4 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
               <h3 className="text-[14px] font-bold text-[#1d2327]">Activity</h3>
            </div>
            <div className="p-4">
               <p className="text-[13px] text-[#3c434a] mb-4">Recently Published</p>
               <ul className="space-y-3">
                  {[1,2,3].map(i => (
                    <li key={i} className="text-[13px] flex items-center gap-4">
                       <span className="text-[#8c8f94] min-w-[120px]">May 11, 10:24 pm</span>
                       <Link href="#" className="text-[#2271b1] hover:text-[#135e96] font-medium">New Order #P-2934 received from Guest</Link>
                    </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
}
