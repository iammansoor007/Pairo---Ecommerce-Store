"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Plus, 
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Circle,
  TrendingUp,
  Infinity
} from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("all"); 
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditData, setQuickEditData] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/products";
      if (view === "trash") url += "?isDeleted=true";
      else if (view === "published") url += "?status=Published";
      
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrash = async (id) => {
    if (!confirm("Are you sure you want to move this product to trash?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openQuickEdit = (p) => {
    setQuickEditId(p._id);
    setQuickEditData({
      name: p.name,
      slug: p.slug,
      price: p.price,
      status: p.status,
      sku: p.sku
    });
  };

  const handleQuickEditSave = async () => {
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...quickEditData, id: quickEditId })
      });
      if (res.ok) {
        setQuickEditId(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [view]);

  const filteredProducts = products.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const skuMatch = p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || skuMatch;
    
    const matchesCategory = selectedCategory === "All categories" || 
                            p.categories?.some(catId => {
                               const cat = categories.find(c => c._id === catId);
                               return cat?.name === selectedCategory;
                            });
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans text-[#3c434a] p-4 bg-[#f0f2f1] min-h-screen">
      {/* WordPress Header */}
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Products</h1>
        <Link href="/admin/products/new" className="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-[3px] text-[13px] font-medium hover:bg-[#f0f6fa] bg-white transition-all">
          Add New
        </Link>
      </div>

      {/* WordPress Subsubsub (Filters) */}
      <ul className="flex items-center gap-2 text-[13px] mb-4 text-[#2271b1]">
         <li className={`${view === "all" ? "text-[#1d2327] font-semibold" : "cursor-pointer hover:text-[#135e96]"}`} onClick={() => setView("all")}>
            All <span className="text-[#646970] font-normal">({view === "all" ? products.length : "-"})</span>
         </li>
         <span className="text-[#c3c4c7]">|</span>
         <li className={`${view === "published" ? "text-[#1d2327] font-semibold" : "cursor-pointer hover:text-[#135e96]"}`} onClick={() => setView("published")}>
            Published <span className="text-[#646970] font-normal">({view === "published" ? products.length : "-"})</span>
         </li>
         <span className="text-[#c3c4c7]">|</span>
         <li className={`${view === "trash" ? "text-[#1d2327] font-semibold" : "cursor-pointer hover:text-[#135e96]"}`} onClick={() => setView("trash")}>
            Trash <span className="text-[#646970] font-normal">({view === "trash" ? products.length : "-"})</span>
         </li>
      </ul>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
         <div className="flex items-center gap-2">
            <select className="border border-[#8c8f94] bg-white text-[14px] px-2 py-1 rounded-[3px] outline-none">
               <option>Bulk actions</option>
               <option>Edit</option>
               <option>Move to Trash</option>
            </select>
            <button className="border border-[#8c8f94] text-[#3c434a] px-3 py-1 rounded-[3px] text-[13px] font-medium bg-[#f6f7f7] hover:bg-[#f0f0f1]">Apply</button>
            
            <select 
              className="border border-[#8c8f94] bg-white text-[14px] px-2 py-1 rounded-[3px] outline-none ml-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
               <option>All categories</option>
               {categories.map(cat => (
                 <option key={cat._id} value={cat.name}>{cat.name}</option>
               ))}
            </select>
            <button className="border border-[#8c8f94] text-[#3c434a] px-3 py-1 rounded-[3px] text-[13px] font-medium bg-[#f6f7f7] hover:bg-[#f0f0f1]">Filter</button>
         </div>

         <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#8c8f94] outline-none px-2 py-1 text-[14px] w-48 bg-white"
            />
            <button className="border border-[#8c8f94] text-[#3c434a] px-3 py-1 rounded-[3px] text-[13px] font-medium bg-[#f6f7f7] hover:bg-[#f0f0f1]">Search Products</button>
         </div>
      </div>

      {/* WordPress Table */}
      <div className="bg-white border border-[#c3c4c7] overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7]">
              <th className="px-3 py-2 w-8"><input type="checkbox" className="w-4 h-4" /></th>
              <th className="px-3 py-2 w-16"><ImageIcon className="w-5 h-5 text-[#8c8f94]" /></th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327]">Name</th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327] w-24">SKU</th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327] w-32">Stock Status</th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327] w-24">Price</th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327] w-40">Categories</th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327] w-24">Status</th>
              <th className="px-3 py-2 text-[14px] font-semibold text-[#1d2327] w-32">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {loading ? (
              <tr><td colSpan={9} className="p-8 text-center text-[13px] text-gray-400">Loading catalog...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-[13px] text-gray-500 italic">No products found.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <React.Fragment key={p._id}>
                  <tr className={`hover:bg-[#f6f7f7] group transition-colors ${quickEditId === p._id ? "bg-[#f0f6fa]" : ""}`}>
                    <td className="px-3 py-4 align-top"><input type="checkbox" className="w-4 h-4" /></td>
                    <td className="px-3 py-4 align-top">
                      <div className="w-12 h-12 bg-white border border-[#dcdcde] flex items-center justify-center">
                         {p.images?.length > 0 ? (
                           <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <ImageIcon className="w-6 h-6 text-[#dcdcde]" />
                         )}
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col">
                         <Link href={`/admin/products/${p._id}`} className="text-[14px] font-semibold text-[#2271b1] hover:text-[#135e96] leading-tight mb-1">{p.name}</Link>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[12px] text-[#2271b1]">
                            {view !== "trash" ? (
                               <>
                                  <Link href={`/admin/products/${p._id}`} className="hover:text-[#135e96]">Edit</Link>
                                  <span className="text-[#c3c4c7]">|</span>
                                  <button onClick={() => openQuickEdit(p)} className="hover:text-[#135e96]">Quick Edit</button>
                                  <span className="text-[#c3c4c7]">|</span>
                                  <button onClick={() => handleTrash(p._id)} className="text-[#d63638] hover:text-[#bc0b0d]">Trash</button>
                                  <span className="text-[#c3c4c7]">|</span>
                                  <Link href={`/product/${p.slug || p._id}`} target="_blank" className="hover:text-[#135e96]">View</Link>
                               </>
                            ) : (
                               <>
                                  <button className="font-bold hover:text-[#135e96]">Restore</button>
                                  <span className="text-[#c3c4c7]">|</span>
                                  <button className="text-[#d63638] font-bold hover:text-[#bc0b0d]">Delete Permanently</button>
                               </>
                            )}
                         </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top text-[13px] text-[#3c434a]">{p.sku || "—"}</td>
                    <td className="px-3 py-4 align-top text-[13px]">
                       {p.manageStock ? (
                          <>
                             <div className="flex items-center gap-2">
                                <Circle className={`w-2 h-2 fill-current ${p.stock > 0 ? "text-green-500" : "text-red-500"}`} />
                                <span className={p.stock > 0 ? "text-[#00a32a]" : "text-[#d63638]"}>
                                   {p.stock > 0 ? `In stock` : "Out of stock"}
                                </span>
                             </div>
                             <span className="text-[11px] text-gray-400">({p.stock || 0})</span>
                          </>
                       ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                             <Infinity className="w-3 h-3" />
                             <span>On backorder</span>
                          </div>
                       )}
                    </td>
                    <td className="px-3 py-4 align-top text-[13px] font-semibold text-[#1d2327]">${p.price?.toFixed(2)}</td>
                    <td className="px-3 py-4 align-top text-[12px] text-[#2271b1] font-medium">
                       {p.categories?.length > 0 ? (
                         p.categories.map((catId, i) => {
                            const cat = categories.find(c => c._id === catId);
                            return (
                               <span key={catId}>
                                  {cat?.name}{i < p.categories.length - 1 ? ", " : ""}
                               </span>
                            );
                         })
                       ) : "—"}
                    </td>
                    <td className="px-3 py-4 align-top">
                       <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] ${p.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {p.status}
                       </span>
                    </td>
                    <td className="px-3 py-4 align-top text-[12px] text-[#646970]">
                       {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>

                  {/* Quick Edit Row */}
                  {quickEditId === p._id && (
                    <tr className="bg-[#f0f6fa] border-b border-[#c3c4c7]">
                      <td colSpan={9} className="p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-1">
                             <label className="text-[11px] font-bold text-gray-500 uppercase">Title</label>
                             <input className="w-full border border-gray-300 p-1.5 text-[13px] bg-white outline-none focus:border-[#2271b1]" value={quickEditData.name} onChange={(e) => setQuickEditData({...quickEditData, name: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[11px] font-bold text-gray-500 uppercase">Slug</label>
                             <input className="w-full border border-gray-300 p-1.5 text-[13px] bg-white outline-none focus:border-[#2271b1]" value={quickEditData.slug} onChange={(e) => setQuickEditData({...quickEditData, slug: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[11px] font-bold text-gray-500 uppercase">Price ($)</label>
                             <input type="number" className="w-full border border-gray-300 p-1.5 text-[13px] bg-white outline-none focus:border-[#2271b1]" value={quickEditData.price} onChange={(e) => setQuickEditData({...quickEditData, price: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[11px] font-bold text-gray-500 uppercase">Status</label>
                             <select className="w-full border border-gray-300 p-1.5 text-[13px] bg-white outline-none focus:border-[#2271b1]" value={quickEditData.status} onChange={(e) => setQuickEditData({...quickEditData, status: e.target.value})}>
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                             </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-200">
                           <button onClick={() => setQuickEditId(null)} className="text-[12px] text-red-600 hover:underline">Cancel</button>
                           <button onClick={handleQuickEditSave} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[12px] font-bold hover:bg-[#135e96]">Update</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-[13px] text-[#646970]">
         <div>{products.length} items</div>
         <div className="flex items-center gap-1">
            <button className="px-2 py-1 bg-white border border-[#dcdcde] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50" disabled>«</button>
            <button className="px-2 py-1 bg-white border border-[#dcdcde] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50" disabled>‹</button>
            <span className="px-3 py-1 border border-[#c3c4c7] bg-[#f6f7f7]">1</span>
            <button className="px-2 py-1 bg-white border border-[#dcdcde] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50" disabled>›</button>
            <button className="px-2 py-1 bg-white border border-[#dcdcde] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50" disabled>»</button>
         </div>
      </div>
    </div>
  );
}
