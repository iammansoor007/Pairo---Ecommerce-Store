"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans text-[#3c434a]">
      <h1 className="text-[23px] font-normal text-[#1d2327] mb-5">Orders</h1>

      {/* Filter Links */}
      <ul className="flex items-center gap-2 text-[13px] mb-4">
         <li className="text-[#1d2327] font-bold">All <span className="text-[#646970] font-normal">({orders.length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Processing <span className="text-[#646970] font-normal">(0)</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Completed <span className="text-[#646970] font-normal">(0)</span></li>
      </ul>

      {/* Bulk Actions & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
         <div className="flex items-center gap-2">
            <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-sm outline-none">
               <option>Bulk actions</option>
               <option>Mark as Processing</option>
               <option>Mark as Completed</option>
               <option>Move to Trash</option>
            </select>
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Apply</button>
         </div>

         <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#8c8f94] outline-none p-1.5 text-[13px] w-48"
            />
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Search Orders</button>
         </div>
      </div>

      {/* WP List Table */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7]">
              <th className="px-3 py-2 w-10"><input type="checkbox" /></th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Order</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Date</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Status</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327] text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-[13px]">Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-[13px]">No orders found.</td></tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-[#f6f7f7] group">
                  <td className="px-3 py-4"><input type="checkbox" /></td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-[#2271b1] hover:text-[#135e96] cursor-pointer">#{o.orderNumber} {o.shippingAddress?.fullName}</span>
                       <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                          <button className="text-[#2271b1] hover:text-[#135e96]">Edit</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="text-[#d63638] hover:text-[#bc0b0d]">Trash</button>
                       </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] text-[#3c434a]">
                     {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4">
                     <span className={`px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-tight ${
                        o.status === "Delivered" ? "bg-[#c6e1c6] text-[#1e4620]" :
                        o.status === "Pending" ? "bg-[#f8dda7] text-[#94660c]" :
                        "bg-[#d5e3ef] text-[#21759b]"
                     }`}>
                        {o.status}
                     </span>
                  </td>
                  <td className="px-3 py-4 text-[13px] font-bold text-right">${o.total?.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
