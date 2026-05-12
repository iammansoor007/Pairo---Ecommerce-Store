"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Calendar,
  User,
  Package,
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&status=${statusFilter}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-[#fcf3d7] text-[#856404] border-[#ffeeba]',
      'Confirmed': 'bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb]',
      'Processing': 'bg-[#e2e3e5] text-[#383d41] border-[#d6d8db]',
      'Shipped': 'bg-[#d4edda] text-[#155724] border-[#c3e6cb]',
      'Delivered': 'bg-[#d4edda] text-[#155724] border-[#c3e6cb]',
      'Cancelled': 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-[#f0f0f1] min-h-screen p-4 md:p-8 font-sans text-[#2c3338]">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* WP Header */}
        <div className="flex items-center justify-between border-b border-[#ccd0d4] pb-4">
          <h1 className="text-[23px] font-normal">Orders <span className="text-[13px] text-[#646970] ml-2">({pagination.total} acquisitions)</span></h1>
          <button className="bg-white border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded text-[13px] font-semibold hover:bg-[#f0f6fb] transition-colors">
            Add New Order
          </button>
        </div>

        {/* Filters Bar (WP Style) */}
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'text-black font-bold' : 'text-[#2271b1]'} hover:text-[#135e96]`}>All</button> |
          <button onClick={() => setStatusFilter('Confirmed')} className={`${statusFilter === 'Confirmed' ? 'text-black font-bold' : 'text-[#2271b1]'} hover:text-[#135e96]`}>Processing</button> |
          <button onClick={() => setStatusFilter('Delivered')} className={`${statusFilter === 'Delivered' ? 'text-black font-bold' : 'text-[#2271b1]'} hover:text-[#135e96]`}>Completed</button> |
          <button onClick={() => setStatusFilter('Cancelled')} className={`${statusFilter === 'Cancelled' ? 'text-black font-bold' : 'text-[#2271b1]'} hover:text-[#135e96]`}>Cancelled</button>
        </div>

        {/* Table Actions Bar */}
        <div className="bg-white border border-[#ccd0d4] p-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select className="border border-[#8c8f94] rounded px-2 py-1 text-[13px] outline-none">
              <option>Bulk actions</option>
              <option>Mark as Processing</option>
              <option>Mark as Completed</option>
              <option>Cancel Orders</option>
            </select>
            <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 rounded text-[13px] font-semibold hover:bg-gray-50">Apply</button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             <input 
              type="text" 
              placeholder="Search orders..." 
              className="border border-[#8c8f94] rounded px-3 py-1 text-[13px] outline-none focus:border-[#2271b1] flex-1 md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
             />
             <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 rounded text-[13px] font-semibold hover:bg-gray-50">Search</button>
          </div>
        </div>

        {/* WP Data Table */}
        <div className="bg-white border border-[#ccd0d4] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#ccd0d4]">
                <th className="px-4 py-2 w-10"><input type="checkbox" /></th>
                <th className="px-4 py-2 font-bold text-[#2c3338]">Order</th>
                <th className="px-4 py-2 font-bold text-[#2c3338]">Date</th>
                <th className="px-4 py-2 font-bold text-[#2c3338]">Status</th>
                <th className="px-4 py-2 font-bold text-[#2c3338]">Total</th>
                <th className="px-4 py-2 font-bold text-[#2c3338] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center italic text-gray-400">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center italic text-gray-400">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f6f7f7] transition-colors group">
                    <td className="px-4 py-4"><input type="checkbox" /></td>
                    <td className="px-4 py-4">
                       <Link href={`/admin/orders/${order._id}`} className="text-[#2271b1] font-bold text-[14px] hover:text-[#135e96]">
                          #{order.orderNumber}
                       </Link>
                       <p className="text-[12px] text-[#646970] font-medium">{order.shippingAddress.fullName}</p>
                    </td>
                    <td className="px-4 py-4 text-[#646970]">
                       {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                       <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status}
                       </span>
                    </td>
                    <td className="px-4 py-4 font-bold">
                       ${order.financials.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/orders/${order._id}`} className="p-1.5 border border-[#ccd0d4] rounded hover:bg-gray-100">
                             <Eye className="w-4 h-4 text-[#646970]" />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* WP Pagination Bar */}
        <div className="flex items-center justify-between text-[13px] text-[#646970]">
           <p>{pagination.total} items</p>
           <div className="flex items-center gap-1">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => fetchOrders(pagination.currentPage - 1)}
                className="p-1 border border-[#ccd0d4] bg-white rounded hover:bg-gray-50 disabled:opacity-50"
              >
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3">{pagination.currentPage} of {pagination.pages}</span>
              <button 
                disabled={pagination.currentPage === pagination.pages}
                onClick={() => fetchOrders(pagination.currentPage + 1)}
                className="p-1 border border-[#ccd0d4] bg-white rounded hover:bg-gray-50 disabled:opacity-50"
              >
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
