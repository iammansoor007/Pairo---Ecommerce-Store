"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-20 text-center text-[13px] text-gray-500 italic">Analyzing store data...</div>;
  if (!stats) return <div className="p-20 text-center text-[13px] text-red-500 font-bold">Failed to load analytics.</div>;

  const overall = stats.overall[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
  const last30 = stats.last30Days[0] || { revenue: 0, count: 0 };

  return (
    <div className="bg-[#f0f0f1] min-h-screen p-4 md:p-8 font-sans text-[#2c3338]">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ccd0d4] pb-6">
          <div className="space-y-1">
             <Link href="/admin/orders" className="text-[#2271b1] hover:text-[#135e96] flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest mb-2">
                <ChevronLeft className="w-3 h-3" /> Back to orders
             </Link>
             <h1 className="text-[23px] font-normal flex items-center gap-3">
               Store Analytics <BarChart3 className="w-6 h-6 text-[#2271b1]" />
             </h1>
          </div>
          <div className="text-right">
             <p className="text-[11px] font-bold text-[#646970] uppercase tracking-widest">Last 30 Days Revenue</p>
             <p className="text-2xl font-bold">${last30.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: `$${overall.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Total Orders', value: overall.totalOrders, icon: Package, color: 'text-[#2271b1]' },
            { label: 'Avg Order Value', value: `$${Math.round(overall.avgOrderValue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Last 30 Days', value: last30.count, icon: Users, color: 'text-purple-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#ccd0d4] p-6 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 bg-gray-50 rounded-lg ${item.color}`}>
                     <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-green-500 flex items-center">
                    <ArrowUpRight className="w-3 h-3" /> 12%
                  </span>
               </div>
               <p className="text-[11px] font-bold text-[#646970] uppercase tracking-widest mb-1">{item.label}</p>
               <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Sales Chart (CSS Based) */}
           <div className="lg:col-span-8 bg-white border border-[#ccd0d4] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#ccd0d4] bg-[#f6f7f7] flex justify-between items-center">
                 <h2 className="text-[14px] font-bold">Sales Performance (Last 30 Days)</h2>
                 <span className="text-[11px] text-[#646970]">Daily Revenue Trend</span>
              </div>
              <div className="p-6">
                 <div className="h-64 flex items-end justify-between gap-1 border-b border-[#ccd0d4] pb-2">
                    {stats.salesByDay.map((day, i) => {
                      const maxRevenue = Math.max(...stats.salesByDay.map(d => d.revenue)) || 1;
                      const height = (day.revenue / maxRevenue) * 100;
                      return (
                        <div key={i} className="group relative flex-1">
                           <div 
                              className="bg-[#2271b1] hover:bg-[#135e96] transition-all rounded-t-sm" 
                              style={{ height: `${Math.max(height, 5)}%` }} 
                           />
                           {/* Tooltip */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[9px] font-bold p-2 rounded whitespace-nowrap z-10 shadow-xl">
                              {new Date(day._id).toLocaleDateString()}<br/>
                              ${day.revenue.toLocaleString()}
                           </div>
                        </div>
                      )
                    })}
                 </div>
                 <div className="flex justify-between text-[9px] font-bold text-[#646970] uppercase tracking-widest mt-4 px-2">
                    <span>{stats.salesByDay[0]?._id}</span>
                    <span>Recent History</span>
                    <span>{stats.salesByDay[stats.salesByDay.length - 1]?._id}</span>
                 </div>
              </div>
           </div>

           {/* Top Products */}
           <div className="lg:col-span-4 bg-white border border-[#ccd0d4] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#ccd0d4] bg-[#f6f7f7]">
                 <h2 className="text-[14px] font-bold">Top Performing Products</h2>
              </div>
              <div className="divide-y divide-[#f0f0f1]">
                 {stats.topProducts.map((product, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="space-y-0.5">
                         <p className="text-[12px] font-bold text-[#2271b1] line-clamp-1">{product._id}</p>
                         <p className="text-[10px] text-[#646970] font-medium">{product.unitsSold} units sold</p>
                      </div>
                      <p className="text-[12px] font-bold text-[#2c3338]">${Math.round(product.revenue).toLocaleString()}</p>
                   </div>
                 ))}
                 {stats.topProducts.length === 0 && <p className="p-8 text-center text-xs italic text-gray-400">No sales data yet.</p>}
              </div>
           </div>

           {/* Variant Insights */}
           <div className="lg:col-span-12 bg-white border border-[#ccd0d4] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#ccd0d4] bg-[#f6f7f7]">
                 <h2 className="text-[14px] font-bold">Variant-Level Intelligence</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-x divide-y md:divide-y-0 border-b border-[#ccd0d4]">
                 {stats.variantInsights.slice(0, 5).map((variant, i) => (
                   <div key={i} className="p-6 space-y-2">
                      <p className="text-[10px] font-bold text-[#646970] uppercase tracking-widest">#{i+1} Best Seller</p>
                      <h3 className="text-[13px] font-bold text-[#2c3338] line-clamp-1">{variant._id.name}</h3>
                      <p className="text-[11px] font-medium text-[#2271b1] uppercase tracking-widest">{variant._id.variant}</p>
                      <div className="flex items-center gap-2 pt-2">
                         <span className="text-xl font-black">{variant.unitsSold}</span>
                         <span className="text-[9px] font-bold text-[#646970] uppercase">Units Shipped</span>
                      </div>
                   </div>
                 ))}
                 {stats.variantInsights.length === 0 && <p className="col-span-full p-8 text-center text-xs italic text-gray-400">Deep variant data will appear as orders are fulfilled.</p>}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
