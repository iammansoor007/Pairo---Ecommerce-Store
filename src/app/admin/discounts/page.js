"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2 } from "lucide-react";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    usageLimit: "",
  });

  const fetchDiscounts = async () => {
    try {
      const res = await fetch("/api/admin/discounts");
      const data = await res.json();
      if (res.ok) setDiscounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ code: "", type: "percentage", value: "", usageLimit: "" });
        fetchDiscounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="font-sans text-[#3c434a]">
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Coupons</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-[14px] font-bold text-[#1d2327] mb-4">Add New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-1">
                <label className="text-[14px] text-[#1d2327]">Coupon Code</label>
                <input 
                   required
                   className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px] uppercase"
                   value={formData.code}
                   onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[14px] text-[#1d2327]">Discount Type</label>
                   <select 
                      className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px] bg-white"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                   >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed amount</option>
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[14px] text-[#1d2327]">Amount</label>
                   <input 
                      type="number"
                      required
                      className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                   />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[14px] text-[#1d2327]">Usage Limit</label>
                <input 
                   type="number"
                   className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                   value={formData.usageLimit}
                   onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                />
             </div>
             <button className="bg-[#2271b1] text-white px-4 py-2 rounded-sm text-[13px] font-medium hover:bg-[#135e96] transition-all">
                Add New Coupon
             </button>
          </form>
        </div>

        <div className="md:col-span-3">
          <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#c3c4c7]">
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Code</th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Amount</th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Usage</th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f1]">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-[13px]">Loading coupons...</td></tr>
                ) : discounts.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-[13px]">No coupons found.</td></tr>
                ) : (
                  discounts.map((d) => (
                    <tr key={d._id} className="hover:bg-[#f6f7f7] group">
                      <td className="px-3 py-4">
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-[#2271b1] hover:text-[#135e96] cursor-pointer">{d.code}</span>
                           <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                              <button className="text-[#2271b1] hover:text-[#135e96]">Edit</button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button className="text-[#d63638] hover:text-[#bc0b0d]">Trash</button>
                           </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-[13px] text-[#3c434a]">
                        {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
                      </td>
                      <td className="px-3 py-4 text-[13px] text-[#3c434a]">
                        {d.usageCount || 0} / {d.usageLimit || "∞"}
                      </td>
                      <td className="px-3 py-4 text-right">
                         <span className="text-[#00a32a] text-[12px] font-bold">Active</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
