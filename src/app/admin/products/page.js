"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Filter,
  Image as ImageIcon,
  Check
} from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) setProducts(data);
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All categories" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans text-[#3c434a]">
      {/* WP Header */}
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Products</h1>
        <Link href="/admin/products/new" className="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-md text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">
          Add New
        </Link>
      </div>

      {/* Filter Links */}
      <ul className="flex items-center gap-2 text-[13px] mb-4">
         <li className="text-[#1d2327] font-bold">All <span className="text-[#646970] font-normal">({products.length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Published <span className="text-[#646970] font-normal">({products.length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Trash <span className="text-[#646970] font-normal">(0)</span></li>
      </ul>

      {/* Bulk Actions & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
         <div className="flex items-center gap-2">
            <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-sm outline-none focus:border-[#2271b1]">
               <option>Bulk actions</option>
               <option>Edit</option>
               <option>Move to Trash</option>
            </select>
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Apply</button>
            
            <select 
              className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-sm outline-none focus:border-[#2271b1] ml-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
               <option>All categories</option>
               {categories.map(cat => (
                 <option key={cat._id} value={cat.name}>{cat.name}</option>
               ))}
            </select>
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Filter</button>
         </div>

         <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[13px] w-48 bg-white"
            />
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Search Products</button>
         </div>
      </div>

      {/* WP List Table */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7]">
              <th className="px-3 py-2 w-10"><input type="checkbox" className="border-[#8c8f94]" /></th>
              <th className="px-3 py-2 w-14"><ImageIcon className="w-4 h-4 text-[#8c8f94]" /></th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327] hover:text-[#2271b1] cursor-pointer">Name</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">SKU</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Stock</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Price</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Categories</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-[13px]">Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-[13px]">No products found.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-[#f6f7f7] group">
                  <td className="px-3 py-3"><input type="checkbox" className="border-[#8c8f94]" /></td>
                  <td className="px-3 py-3">
                    <div className="w-10 h-10 bg-[#f0f0f1] border border-[#dcdcde] rounded-sm overflow-hidden">
                       {p.images?.length > 0 ? (
                         <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <ImageIcon className="w-full h-full p-2 text-black/10" />
                       )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                       <Link href={`/admin/products/${p._id}`} className="text-[14px] font-bold text-[#2271b1] hover:text-[#135e96]">{p.name}</Link>
                       <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                          <Link href={`/admin/products/${p._id}`} className="text-[#2271b1] hover:text-[#135e96]">Edit</Link>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="text-[#2271b1] hover:text-[#135e96]">Quick Edit</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="text-[#d63638] hover:text-[#bc0b0d]">Trash</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <Link href={`/product/${p.slug}`} target="_blank" className="text-[#2271b1] hover:text-[#135e96]">View</Link>
                       </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#3c434a]">{p.sku || "—"}</td>
                  <td className="px-3 py-3 text-[13px]">
                     <span className={p.inventory?.stock > 0 ? "text-[#00a32a]" : "text-[#d63638]"}>
                        {p.inventory?.stock > 0 ? `In stock (${p.inventory.stock})` : "Out of stock"}
                     </span>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-bold">${p.price?.toFixed(2)}</td>
                  <td className="px-3 py-3 text-[13px] text-[#2271b1] hover:text-[#135e96] cursor-pointer">
                     {p.category || "—"}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#3c434a]">
                     Published<br />
                     <span className="text-black/40 text-[11px]">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between mt-4 text-[13px]">
         <div className="text-[#646970]">{products.length} items</div>
         <div className="flex items-center gap-2">
            <button className="px-2 py-1 bg-[#f6f7f7] border border-[#dcdcde] rounded-sm disabled:opacity-50" disabled>«</button>
            <button className="px-2 py-1 bg-[#f6f7f7] border border-[#dcdcde] rounded-sm disabled:opacity-50" disabled>‹</button>
            <span className="px-3 py-1 border border-[#c3c4c7] bg-white">1</span>
            <button className="px-2 py-1 bg-[#f6f7f7] border border-[#dcdcde] rounded-sm disabled:opacity-50" disabled>›</button>
            <button className="px-2 py-1 bg-[#f6f7f7] border border-[#dcdcde] rounded-sm disabled:opacity-50" disabled>»</button>
         </div>
      </div>
    </div>
  );
}
