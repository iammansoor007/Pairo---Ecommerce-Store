"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

// ── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Pending:           "bg-[#fcf9e8] text-[#8a6914]",
    Confirmed:         "bg-[#eaf3fb] text-[#1a6096]",
    Processing:        "bg-[#eaf3fb] text-[#1a6096]",
    Packed:            "bg-[#edfaef] text-[#1a7c34]",
    Shipped:           "bg-[#edfaef] text-[#1a7c34]",
    "Out for Delivery":"bg-[#edfaef] text-[#1a7c34]",
    Delivered:         "bg-[#edfaef] text-[#1a7c34]",
    Cancelled:         "bg-[#fef0f0] text-[#b32d2e]",
    Refunded:          "bg-[#f6f7f7] text-[#646970]",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Woo-Style Stat Card ───────────────────────────────────
function WooCard({ label, value, sub, color, delta }) {
  return (
    <div className="bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)] overflow-hidden">
      <div className="h-[4px]" style={{ background: color }} />
      <div className="p-5 pb-4">
        <p className="text-[12px] text-[#646970] uppercase tracking-wider font-semibold mb-3">{label}</p>
        <p className="text-[32px] font-light text-[#1d2327] leading-none tracking-tight">{value}</p>
        {sub && <p className="text-[12px] text-[#8c8f94] mt-2">{sub}</p>}
        {delta !== undefined && (
          <p className={`text-[12px] mt-1 font-medium ${delta >= 0 ? "text-[#00a32a]" : "text-[#d63638]"}`}>
            {delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toLocaleString()} vs prev period
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pure CSS Spark Bar ────────────────────────────────────
function SparkBars({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[120px] text-[13px] text-[#8c8f94] italic">
        No sales data for this period yet.
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-[2px] h-[120px]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 relative group flex flex-col justify-end h-full">
            <div
              className="w-full rounded-t-[2px] transition-all"
              style={{
                height: `${Math.max(3, (d.revenue / max) * 120)}px`,
                background: "#674399"
              }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1d2327] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
              <div className="font-bold">${d.revenue?.toLocaleString()}</div>
              <div className="text-[#a7aaad]">{d.orders} order{d.orders !== 1 ? "s" : ""} · {d._id}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 border-t border-[#f0f0f1] pt-1.5">
        <span className="text-[10px] text-[#8c8f94]">{data[0]?._id}</span>
        <span className="text-[10px] text-[#8c8f94]">{data[data.length - 1]?._id}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const overall    = data?.overall?.[0]   || {};
  const last30     = data?.last30Days?.[0] || {};
  const last7      = data?.last7Days?.[0]  || {};
  const salesByDay = data?.salesByDay     || [];
  const topProds   = data?.topProducts    || [];
  const variants   = data?.variantInsights || [];
  const recent     = data?.recentOrders   || [];
  const statuses   = data?.statusBreakdown || [];
  const chartData  = salesByDay.slice(-14);

  return (
    <div className="font-sans text-[#1d2327]">

      {/* ── Page Title Bar ── */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[23px] font-normal">Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 text-[13px] text-[#646970] hover:text-[#1d2327] disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Refresh"}
        </button>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-[#ccd0d4] h-[120px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── WooCommerce-style Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <WooCard
              label="Total Revenue"
              value={`$${(overall.totalRevenue || 0).toLocaleString()}`}
              sub={`$${(last30.revenue || 0).toLocaleString()} last 30 days`}
              color="#674399"
            />
            <WooCard
              label="Net Sales"
              value={`$${(last7.revenue || 0).toLocaleString()}`}
              sub="Last 7 days"
              color="#2271b1"
            />
            <WooCard
              label="Total Orders"
              value={(overall.totalOrders || 0).toLocaleString()}
              sub={`${last30.count || 0} this month`}
              color="#d63638"
            />
            <WooCard
              label="Avg Order Value"
              value={`$${(overall.avgOrderValue || 0).toFixed(0)}`}
              sub={`${data?.totalProducts || 0} products · ${data?.totalUsers || 0} customers`}
              color="#00a32a"
            />
          </div>

          {/* ── Revenue Chart + Status + At a Glance ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)]">
              <div className="px-4 py-3 border-b border-[#ccd0d4]">
                <h2 className="text-[14px] font-semibold">Revenue (Last 14 Days)</h2>
              </div>
              <div className="p-5">
                <SparkBars data={chartData} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">

              {/* At a Glance */}
              <div className="bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)]">
                <div className="px-4 py-3 border-b border-[#ccd0d4]">
                  <h2 className="text-[14px] font-semibold">At a Glance</h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Products",   val: data?.totalProducts || 0,      href: "/admin/products",  color: "#00a32a" },
                    { label: "Orders",     val: overall.totalOrders || 0,       href: "/admin/orders",    color: "#2271b1" },
                    { label: "Customers",  val: data?.totalUsers || 0,          href: "/admin/users",     color: "#674399" },
                    { label: "This Month", val: `$${(last30.revenue||0).toLocaleString()}`, href: "/admin/orders", color: "#d63638" },
                  ].map(item => (
                    <Link key={item.label} href={item.href}
                      className="flex flex-col p-3 border border-[#f0f0f1] hover:border-[#c3c4c7] transition-colors rounded-sm group">
                      <span className="text-[22px] font-light" style={{ color: item.color }}>{item.val}</span>
                      <span className="text-[12px] text-[#646970] group-hover:text-[#2271b1] transition-colors">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)]">
                <div className="px-4 py-3 border-b border-[#ccd0d4]">
                  <h2 className="text-[14px] font-semibold">Orders by Status</h2>
                </div>
                <div className="p-3 space-y-1.5">
                  {statuses.length === 0 ? (
                    <p className="text-[12px] text-[#8c8f94] italic p-2">No orders yet.</p>
                  ) : statuses.map(s => (
                    <div key={s._id} className="flex items-center justify-between py-1 border-b border-[#f6f7f7] last:border-0">
                      <StatusBadge status={s._id} />
                      <span className="text-[13px] font-semibold text-[#1d2327]">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Top Products + Variants ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Top Products */}
            <div className="bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)]">
              <div className="px-4 py-3 border-b border-[#ccd0d4] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold">Top Products</h2>
                <Link href="/admin/products" className="text-[12px] text-[#2271b1] hover:text-[#135e96]">View all</Link>
              </div>
              <table className="w-full text-[13px]">
                <thead className="bg-[#f6f7f7]">
                  <tr>
                    <th className="text-left px-4 py-2 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Product</th>
                    <th className="text-center px-3 py-2 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Sold</th>
                    <th className="text-right px-4 py-2 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f6f7f7]">
                  {topProds.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-[#8c8f94] italic">No orders yet</td></tr>
                  ) : topProds.map((p, i) => (
                    <tr key={i} className="hover:bg-[#f6f7f7]">
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-[#2271b1] truncate block max-w-[200px]">{p._id}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-semibold">{p.unitsSold}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#00a32a]">
                        ${p.revenue?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Variants */}
            <div className="bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)]">
              <div className="px-4 py-3 border-b border-[#ccd0d4]">
                <h2 className="text-[14px] font-semibold">Top Variants Sold</h2>
              </div>
              <table className="w-full text-[13px]">
                <thead className="bg-[#f6f7f7]">
                  <tr>
                    <th className="text-left px-4 py-2 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Product / Variant</th>
                    <th className="text-right px-4 py-2 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f6f7f7]">
                  {variants.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-6 text-center text-[#8c8f94] italic">No orders yet</td></tr>
                  ) : variants.map((v, i) => (
                    <tr key={i} className="hover:bg-[#f6f7f7]">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[#2c3338]">{v._id?.name}</p>
                        {v._id?.variant && (
                          <p className="text-[11px] text-[#8c8f94]">{v._id.variant}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">{v.unitsSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Recent Orders ── */}
          <div className="bg-white border border-[#ccd0d4] shadow-[0_1px_1px_rgba(0,0,0,.04)]">
            <div className="px-4 py-3 border-b border-[#ccd0d4] flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-[12px] text-[#2271b1] hover:text-[#135e96]">View all orders →</Link>
            </div>
            <table className="w-full text-[13px]">
              <thead className="bg-[#f6f7f7]">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Order</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-2.5 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-2.5 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Total</th>
                  <th className="text-right px-4 py-2.5 text-[11px] text-[#646970] font-semibold uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f7f7]">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#8c8f94] italic">No orders yet.</td>
                  </tr>
                ) : recent.map(order => (
                  <tr key={order._id} className="hover:bg-[#f6f7f7]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order._id}`} className="text-[#2271b1] hover:text-[#135e96] font-semibold">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#3c434a]">
                      {order.shippingAddress?.fullName || order.customer?.email || "Guest"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${(order.financials?.total || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-[#646970]">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
