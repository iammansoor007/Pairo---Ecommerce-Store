"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  FileText, 
  Package, 
  MessageSquare, 
  ShoppingBag, 
  ChevronRight, 
  ExternalLink,
  Plus,
  Settings,
  HelpCircle,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  TrendingUp
} from "lucide-react";

// ── WordPress-Style Meta Box ───────────────────────────────
function MetaBox({ title, children, footer, className = "" }) {
  return (
    <div className={`bg-white border border-[#c3c4c7] shadow-sm mb-5 ${className}`}>
      {title && (
        <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#1d2327]">{title}</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </button>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-3 py-2">
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    posts: 0,
    orders: 0,
    revenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const [ordersRes, affiliatesRes, productsRes] = await Promise.all([
        fetch("/api/admin/orders?status=Pending"),
        fetch("/api/admin/affiliates/requests"),
        fetch("/api/admin/products")
      ]);

      let orderNotices = [];
      let affiliateNotices = [];
      let productNotices = [];

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success && Array.isArray(data.orders)) {
          orderNotices = data.orders.map(order => ({
            id: `order-${order._id}`,
            type: "order",
            targetId: order._id,
            text: `New order request #${order.orderNumber} received from ${order.shippingAddress?.fullName || order.customer?.email || "Guest"}. (Total: $${order.financials?.total || 0})`,
            actions: [
              { label: "Confirm Order", action: () => handleOrderAction(order._id, "Confirmed") },
              { label: "View Details", href: `/admin/orders/${order._id}` }
            ]
          }));
        }
      }

      if (affiliatesRes.ok) {
        const data = await affiliatesRes.json();
        if (data.success && Array.isArray(data.applications)) {
          affiliateNotices = data.applications.filter(app => app.status === "Pending").map(app => ({
            id: `affiliate-${app._id}`,
            type: "affiliate",
            targetId: app._id,
            text: `New affiliate request from ${app.name} (${app.email}) is pending review.`,
            actions: [
              { label: "Approve", action: () => handleAffiliateAction(app._id, "Approve") },
              { label: "Reject", action: () => handleAffiliateAction(app._id, "Reject") }
            ]
          }));
        }
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        const list = Array.isArray(data) ? data : [];
        productNotices = list.filter(p => p.manageStock && p.stock <= (p.lowStockThreshold || 5)).map(p => ({
          id: `product-${p._id}`,
          type: "product",
          targetId: p._id,
          text: `Product '${p.name}' is running low in stock (${p.stock} units remaining).`,
          actions: [
            { label: "Restock / Edit", href: `/admin/products/${p._id}` }
          ]
        }));
      }

      setNotifications([...orderNotices, ...affiliateNotices, ...productNotices]);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, []);

  const handleOrderAction = async (id, status) => {
    setUpdatingId(`order-${id}`);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Order status updated to ${status}!`);
        await fetchNotifications();
      } else {
        alert("Failed to update order.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAffiliateAction = async (applicationId, action) => {
    setUpdatingId(`affiliate-${applicationId}`);
    try {
      const res = await fetch("/api/admin/affiliates/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action })
      });
      if (res.ok) {
        alert(`Affiliate application ${action === 'Approve' ? 'approved' : 'rejected'} successfully!`);
        await fetchNotifications();
      } else {
        const data = await res.json();
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const d = json.data;
          setStats({
            products: d.totalProducts || 0,
            posts: d.totalBlogs || 0,
            orders: d.overall?.[0]?.totalOrders || 0,
            revenue: d.overall?.[0]?.totalSales || 0,
            recentOrders: d.recentOrders || []
          });
        }
        setLoading(false);
      });
    
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="font-sans text-[#3c434a] bg-[#f0f2f1] min-h-screen p-4 md:p-6">
      <div className="w-full">
        {/* Welcome Panel */}
        <div className="bg-[#1d2327] text-white p-8 mb-8 relative overflow-hidden rounded-[2px] shadow-sm">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-[32px] font-light mb-4">Welcome to Pairo Store</h1>
            <p className="text-[16px] text-gray-300 mb-6 leading-relaxed">
              Manage your online store, write blog posts, and track your analytics from one central dashboard. 
              Everything is set up and ready for you to grow your business.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/products/new" className="bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2.5 rounded-[3px] text-[14px] font-bold transition-all">
                Add New Product
              </Link>
              <Link href="/admin/blogs/new" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-[3px] text-[14px] font-bold transition-all">
                Write Blog Post
              </Link>
            </div>
          </div>
          <div className="absolute right-[-100px] bottom-[-100px] opacity-10 pointer-events-none">
             <ShoppingBag className="w-[400px] h-[400px]" />
          </div>
        </div>

        {/* WP Admin Notices Section */}
        {notifications.length > 0 && (
          <div className="space-y-3 mb-8">
            {notifications.map((notice) => {
              let borderClass = "border-l-4 border-l-[#72aee6]"; // default info
              if (notice.type === "product") borderClass = "border-l-4 border-l-[#d63638]"; // error red
              if (notice.type === "order" || notice.type === "affiliate") borderClass = "border-l-4 border-l-[#f0b849]"; // warning yellow
              
              const isUpdating = updatingId === notice.id;

              return (
                <div key={notice.id} className={`bg-white border border-[#ccd0d4] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${borderClass} transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className="text-[13px] text-[#2c3338] font-medium leading-relaxed">
                      {notice.text}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.actions.map((act, i) => {
                      if (act.href) {
                        return (
                          <Link
                            key={i}
                            href={act.href}
                            className="border border-[#8c8f94] text-[#2271b1] hover:text-[#135e96] bg-[#f6f7f7] hover:bg-[#f0f0f1] px-3 py-1 rounded-[3px] text-[12px] font-bold shadow-sm transition-all"
                          >
                            {act.label}
                          </Link>
                        );
                      }
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={isUpdating}
                          onClick={act.action}
                          className={`border border-[#2271b1] text-white bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-50 px-3 py-1 rounded-[3px] text-[12px] font-bold shadow-sm transition-all cursor-pointer ${
                            act.label === "Reject" ? "border-[#d63638] bg-[#d63638] hover:bg-[#bc0b0d]" : ""
                          }`}
                        >
                          {isUpdating ? "Processing..." : act.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
          
          {/* Left Column (Primary) */}
          <div className="lg:col-span-3">
            
            {/* At a Glance */}
            <MetaBox title="At a Glance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                 <div className="space-y-4">
                    <Link href="/admin/blogs" className="flex items-center gap-2 group">
                       <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                       <span className="text-[13px] text-[#2271b1] hover:underline font-medium">{stats.posts} Posts</span>
                    </Link>
                    <Link href="/admin/media" className="flex items-center gap-2 group">
                       <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                       <span className="text-[13px] text-[#2271b1] hover:underline font-medium">Media Library</span>
                    </Link>
                 </div>
                 <div className="space-y-4">
                    <Link href="/admin/products" className="flex items-center gap-2 group">
                       <Package className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                       <span className="text-[13px] text-[#2271b1] hover:underline font-medium">{stats.products} Products</span>
                    </Link>
                    <div className="flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-gray-400" />
                       <span className="text-[13px] text-gray-600">0 Comments</span>
                    </div>
                 </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0f0f1] text-[13px] text-gray-500 italic">
                 Pairo v1.0.0 running Modern Theme.
              </div>
            </MetaBox>

            {/* Activity */}
            <MetaBox title="Recent Activity">
               <div className="space-y-4">
                  {loading ? (
                    <p className="text-[13px] text-gray-400 italic">Loading activity...</p>
                  ) : stats.recentOrders.length === 0 ? (
                    <p className="text-[13px] text-gray-400 italic">No recent activity found.</p>
                  ) : (
                    <div className="divide-y divide-[#f0f0f1]">
                       {stats.recentOrders.map((order, idx) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between group">
                             <div className="flex items-start gap-3">
                                <div className="mt-1">
                                   <div className="w-2 h-2 rounded-full bg-[#2271b1]" />
                                </div>
                                <div className="flex flex-col">
                                   <Link href={`/admin/orders/${order._id}`} className="text-[13px] font-bold text-[#2271b1] group-hover:underline">
                                      Order #{order.orderNumber}
                                   </Link>
                                   <span className="text-[12px] text-gray-500">by {order.shippingAddress?.fullName}</span>
                                </div>
                             </div>
                             <span className="text-[11px] text-gray-400 font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                       ))}
                    </div>
                  )}
               </div>
            </MetaBox>

          </div>

          {/* Right Column (Secondary) */}
          <div className="lg:col-span-2 space-y-5">
             
             {/* WooCommerce Status */}
             <MetaBox title="WooCommerce Status">
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-3">
                      <div className="flex flex-col">
                         <span className="text-[12px] text-gray-500 uppercase font-bold tracking-wider">Net Sales</span>
                         <span className="text-[24px] font-light text-[#1d2327]">${stats.revenue.toLocaleString()}</span>
                      </div>
                      <TrendingUp className="w-8 h-8 text-[#00a32a] opacity-20" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#f6f7f7] p-3 rounded-[2px] border border-[#ccd0d4]">
                         <span className="text-[11px] text-gray-500 block mb-1">Orders</span>
                         <span className="text-[18px] font-bold text-[#1d2327]">{stats.orders}</span>
                      </div>
                      <div className="bg-[#f6f7f7] p-3 rounded-[2px] border border-[#ccd0d4]">
                         <span className="text-[11px] text-gray-500 block mb-1">Awaiting Processing</span>
                         <span className="text-[18px] font-bold text-[#d63638]">0</span>
                      </div>
                   </div>

                   <Link href="/admin/orders" className="text-[13px] text-[#2271b1] hover:underline flex items-center gap-1 font-medium">
                      View all orders <ArrowRight className="w-3 h-3" />
                   </Link>
                </div>
             </MetaBox>

             {/* Quick Links */}
             <MetaBox title="Quick Links">
                <div className="grid grid-cols-1 gap-2">
                   {[
                      { label: "Site Settings", href: "/admin/settings", icon: Settings },
                      { label: "E-commerce Support", href: "#", icon: HelpCircle },
                      { label: "View Storefront", href: "/", icon: ExternalLink },
                   ].map((item, i) => (
                      <Link key={i} href={item.href} className="flex items-center justify-between p-2 hover:bg-[#f6f7f7] rounded-[2px] transition-colors group">
                         <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-gray-400 group-hover:text-[#2271b1]" />
                            <span className="text-[13px] text-[#2271b1] font-medium">{item.label}</span>
                         </div>
                         <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#2271b1]" />
                      </Link>
                   ))}
                </div>
             </MetaBox>

             {/* Dashboard Widgets Help */}
             <div className="text-[12px] text-gray-500 px-2 flex items-center gap-2">
                <HelpCircle className="w-3 h-3" />
                <span>Learn more about <button className="text-[#2271b1] hover:underline">Dashboard Widgets</button></span>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}
