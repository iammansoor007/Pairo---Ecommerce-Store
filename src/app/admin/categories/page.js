"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent: "None",
    description: ""
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ name: "", slug: "", parent: "None", description: "" });
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="font-sans text-[#3c434a]">
      <h1 className="text-[23px] font-normal text-[#1d2327] mb-5">Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: Add New Form */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-[14px] font-bold text-[#1d2327] mb-4">Add New Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[14px] text-[#1d2327]">Name</label>
                <input 
                  required
                  className="w-full border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none p-1.5 text-[14px]"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <p className="text-[12px] text-[#646970] italic">The name is how it appears on your site.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] text-[#1d2327]">Slug</label>
                <input 
                  className="w-full border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none p-1.5 text-[14px]"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                />
                <p className="text-[12px] text-[#646970] italic">The “slug” is the URL-friendly version of the name.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] text-[#1d2327]">Parent Category</label>
                <select 
                  className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px] bg-white"
                  value={formData.parent}
                  onChange={(e) => setFormData({...formData, parent: e.target.value})}
                >
                  <option>None</option>
                  {categories.map(cat => <option key={cat._id}>{cat.name}</option>)}
                </select>
                <p className="text-[12px] text-[#646970] italic">Categories, unlike tags, can have a hierarchy.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] text-[#1d2327]">Description</label>
                <textarea 
                  rows={4}
                  className="w-full border border-[#8c8f94] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none p-1.5 text-[14px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <p className="text-[12px] text-[#646970] italic">The description is not prominent by default.</p>
              </div>

              <button className="bg-[#2271b1] text-white px-4 py-2 rounded-sm text-[13px] font-medium hover:bg-[#135e96] transition-all">
                Add New Category
              </button>
            </form>
          </div>
        </div>

        {/* Right: List Table */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between gap-4 mb-2">
             <div className="flex items-center gap-2">
                <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-sm outline-none">
                   <option>Bulk actions</option>
                   <option>Delete</option>
                </select>
                <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Apply</button>
             </div>
             <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-[#8c8f94] outline-none p-1.5 text-[13px] w-32"
                />
                <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Search</button>
             </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#c3c4c7]">
                  <th className="px-3 py-2 w-10"><input type="checkbox" /></th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Name</th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Description</th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Slug</th>
                  <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327] text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f1]">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-[13px]">Loading categories...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-[13px]">No categories found.</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-[#f6f7f7] group">
                      <td className="px-3 py-3"><input type="checkbox" /></td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-[#2271b1] hover:text-[#135e96] cursor-pointer">{cat.name}</span>
                           <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                              <button className="text-[#2271b1] hover:text-[#135e96]">Edit</button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button className="text-[#2271b1] hover:text-[#135e96]">Quick Edit</button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button className="text-[#d63638] hover:text-[#bc0b0d]">Delete</button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button className="text-[#2271b1] hover:text-[#135e96]">View</button>
                           </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[#3c434a] italic">{cat.description || "—"}</td>
                      <td className="px-3 py-3 text-[13px] text-[#3c434a]">{cat.slug}</td>
                      <td className="px-3 py-3 text-[13px] text-[#2271b1] font-bold text-right">{cat.count || 0}</td>
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
