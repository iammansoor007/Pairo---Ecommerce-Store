"use client";

import React, { useEffect, useState } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import MediaPicker from "@/components/admin/MediaPicker";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/admin/TiptapEditor";

export default function CategoryForm({ categoryId = null, type = "product" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(categoryId ? true : false);
  const [saving, setSaving] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    slug: "",
    description: "",
    content: "",
    image: "",
    status: "Published",
    isFeatured: false,
    seo: { title: "", description: "", keywords: [], canonicalUrl: "", ogTitle: "", ogDescription: "", ogImage: "", noIndex: false, noFollow: false },
    linkedItems: [],
    type: type
  });

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/admin/categories?type=${type}`);
      const data = await res.json();
      const cat = data.find(c => c._id === categoryId);
      if (cat) {
        setFormData(prev => ({
          ...prev,
          ...cat,
          seo: { ...prev.seo, ...(cat.seo || {}) }
        }));
        return cat;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const fetchAvailableItems = async (fetchedCat) => {
    try {
      const endpoint = type === 'product' ? '/api/admin/products' : '/api/admin/blogs';
      const res = await fetch(`${endpoint}?status=Published`);
      const data = await res.json();
      if (res.ok) {
         const items = Array.isArray(data) ? data : (data.products || []);
         setAvailableItems(items);
         
         if (categoryId) {
            let currentLinked = [];
            if (type === 'product') {
               currentLinked = items.filter(p => (p.categories || []).includes(categoryId)).map(p => p._id);
            } else if (fetchedCat && fetchedCat.name) {
               currentLinked = items.filter(b => b.category === fetchedCat.name).map(b => b._id);
            }
            setFormData(prev => ({...prev, linkedItems: currentLinked}));
         }
      }
    } catch (err) {
       console.error("Failed to fetch available items", err);
    }
  };

  useEffect(() => {
    const init = async () => {
       let cat = null;
       if (categoryId) cat = await fetchCategory();
       await fetchAvailableItems(cat);
       setLoading(false);
    };
    init();
  }, [categoryId, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = formData._id ? "PUT" : "POST";
      const body = { ...formData, id: formData._id };
      
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        router.push(type === 'product' ? '/admin/products/categories' : '/admin/blogs/categories');
      } else {
        const data = await res.json();
        alert("Error saving category: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save category. Check console.");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = availableItems.filter(i => 
    i.title?.toLowerCase().includes(itemSearchTerm.toLowerCase()) || 
    i.name?.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const breadcrumbs = type === "product"
    ? [{ label: "WooCommerce", href: "/admin/orders" }, { label: "Categories", href: "/admin/products/categories" }, { label: categoryId ? "Edit" : "New" }]
    : [{ label: "Blog", href: "/admin/blogs" }, { label: "Categories", href: "/admin/blogs/categories" }, { label: categoryId ? "Edit" : "New" }];

  if (loading) return <div className="p-10 text-[13px] font-medium text-gray-500 bg-[#f0f2f1] min-h-screen">Loading editor...</div>;

  return (
    <AdminPageLayout 
      title={categoryId ? "Edit Category" : "Add New Category"} 
      breadcrumbs={breadcrumbs}
      addNewLink={type === 'product' ? "/admin/products/categories/new" : "/admin/blogs/categories/new"}
      addNewLabel="Add New"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
         {/* Main Column */}
         <div className="lg:col-span-3 space-y-4">
            <div className="space-y-1">
               <input
                  required
                  placeholder="Enter title here"
                  className="w-full border border-[#c3c4c7] outline-none px-3 py-2 text-[20px] bg-white shadow-inner font-semibold"
                  value={formData.name}
                  onChange={(e) => {
                     const name = e.target.value;
                     const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                     setFormData({...formData, name, slug: formData._id ? formData.slug : slug});
                  }}
               />
               <div className="text-[12px] text-gray-500 px-1 mt-1 flex items-center gap-1">
                  Permalink: <span className="text-gray-400">pairo.store/{type}-category/</span>
                  <input className="border-none bg-transparent outline-none text-[#2271b1] font-mono w-fit min-w-[50px]" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
               </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white border border-[#c3c4c7] shadow-sm">
               <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 flex items-center justify-between font-bold text-[13px] text-gray-700">
                  Full Description
               </div>
               <div className="p-0">
                  <TiptapEditor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
               </div>
            </div>

            {/* Short Description */}
            <div className="bg-white border border-[#c3c4c7] shadow-sm">
               <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 font-bold text-[13px] text-gray-700">Short Description</div>
               <div className="p-3">
                  <textarea 
                     rows={3}
                     className="w-full border border-[#c3c4c7] outline-none p-2 text-[13px]"
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
               </div>
            </div>

            {/* Link Items */}
            <div className="bg-white border border-[#c3c4c7] shadow-sm">
               <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 font-bold text-[13px] text-gray-700 flex justify-between">
                  <span>Link {type === 'product' ? 'Products' : 'Blogs'}</span>
                  <span className="text-[#2271b1]">{formData.linkedItems.length} selected</span>
               </div>
               <div className="p-3 space-y-3">
                  <input 
                     type="text" 
                     placeholder={`Search ${type}s...`}
                     value={itemSearchTerm}
                     onChange={(e) => setItemSearchTerm(e.target.value)}
                     className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[12px] focus:border-[#2271b1] outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto border border-gray-200 divide-y divide-gray-100">
                     {filteredItems.length === 0 ? (
                        <div className="p-3 text-center text-gray-400 text-[12px]">No items available.</div>
                     ) : (
                        filteredItems.map(item => (
                           <label key={item._id} className="flex items-center gap-3 p-2 hover:bg-[#f6f7f7] cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 className="w-4 h-4 text-[#2271b1]"
                                 checked={formData.linkedItems.includes(item._id)}
                                 onChange={(e) => {
                                    if(e.target.checked) setFormData({...formData, linkedItems: [...formData.linkedItems, item._id]});
                                    else setFormData({...formData, linkedItems: formData.linkedItems.filter(id => id !== item._id)});
                                 }}
                              />
                              <span className="text-[13px]">{item.title || item.name}</span>
                           </label>
                        ))
                     )}
                  </div>
               </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white border border-[#c3c4c7] shadow-sm">
               <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 font-bold text-[13px] text-gray-700">Yoast SEO</div>
               <div className="p-4 space-y-6">
                  {/* SEO Preview */}
                  <div className="bg-gray-50 p-4 border border-gray-200 space-y-1">
                     <p className="text-[11px] text-gray-500 mb-2 uppercase font-bold tracking-wider">Search Engine Snippet Preview</p>
                     <div className="text-[18px] text-[#1a0dab] truncate font-medium hover:underline cursor-pointer">{formData.seo?.title || formData.name || "Category Title"}</div>
                     <div className="text-[13px] text-[#006621] truncate">https://pairo.store/{type}-category/{formData.slug || "slug"}</div>
                     <div className="text-[13px] text-[#545454] line-clamp-2 mt-1">{formData.seo?.description || formData.description || "Provide a meta description to see how this category will appear in search results."}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <div className="flex justify-between">
                              <label className="text-[12px] font-bold text-gray-700">SEO Title</label>
                              <span className={`text-[10px] ${(formData.seo?.title || "").length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{(formData.seo?.title || "").length}/60</span>
                           </div>
                           <input className="w-full border border-[#c3c4c7] p-2 text-[13px] outline-none" value={formData.seo?.title || ""} onChange={e=>setFormData({...formData, seo: {...formData.seo, title: e.target.value}})} />
                        </div>
                        <div className="space-y-1">
                           <div className="flex justify-between">
                              <label className="text-[12px] font-bold text-gray-700">Meta Description</label>
                              <span className={`text-[10px] ${(formData.seo?.description || "").length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{(formData.seo?.description || "").length}/160</span>
                           </div>
                           <textarea className="w-full border border-[#c3c4c7] p-2 text-[13px] outline-none resize-none" rows={3} value={formData.seo?.description || ""} onChange={e=>setFormData({...formData, seo: {...formData.seo, description: e.target.value}})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[12px] font-bold text-gray-700">Canonical URL</label>
                           <input className="w-full border border-[#c3c4c7] p-2 text-[13px] outline-none font-mono" placeholder="https://" value={formData.seo?.canonicalUrl || ""} onChange={e=>setFormData({...formData, seo: {...formData.seo, canonicalUrl: e.target.value}})} />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[12px] font-bold text-gray-700">Open Graph Title (Social)</label>
                           <input className="w-full border border-[#c3c4c7] p-2 text-[13px] outline-none" value={formData.seo?.ogTitle || ""} onChange={e=>setFormData({...formData, seo: {...formData.seo, ogTitle: e.target.value}})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[12px] font-bold text-gray-700">Open Graph Description</label>
                           <textarea className="w-full border border-[#c3c4c7] p-2 text-[13px] outline-none resize-none" rows={2} value={formData.seo?.ogDescription || ""} onChange={e=>setFormData({...formData, seo: {...formData.seo, ogDescription: e.target.value}})} />
                        </div>
                        <div className="p-3 bg-[#f6f7f7] border border-[#c3c4c7] space-y-2">
                           <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer">
                              <input type="checkbox" checked={formData.seo?.noIndex} onChange={e=>setFormData({...formData, seo: {...formData.seo, noIndex: e.target.checked}})} />
                              No Index
                           </label>
                           <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer">
                              <input type="checkbox" checked={formData.seo?.noFollow} onChange={e=>setFormData({...formData, seo: {...formData.seo, noFollow: e.target.checked}})} />
                              No Follow
                           </label>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar Column */}
         <div className="space-y-4">
            <div className="bg-white border border-[#c3c4c7] shadow-sm">
               <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Publish</div>
               <div className="p-3 space-y-4 text-[13px]">
                  <div className="space-y-3 py-2">
                     <p className="flex items-center gap-2"><span className="text-gray-500 w-16">Status:</span> 
                        <select className="border border-[#c3c4c7] px-1 py-0.5" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                           <option>Published</option>
                           <option>Draft</option>
                        </select>
                     </p>
                     <p className="flex items-center gap-2"><span className="text-gray-500 w-16">Visibility:</span> <strong>Public</strong></p>
                     <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} />
                        Featured Category
                     </label>
                  </div>
                  <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] -mx-3 -mb-3 p-3 flex justify-between items-center">
                     <button type="button" onClick={() => router.push(type === 'product' ? '/admin/products/categories' : '/admin/blogs/categories')} className="text-red-600 hover:underline">Cancel</button>
                     <button type="submit" disabled={saving} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] font-bold hover:bg-[#135e96]">
                        {saving ? "Saving..." : (categoryId ? "Update" : "Publish")}
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-[#c3c4c7] shadow-sm">
               <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Category Image</div>
               <div className="p-3">
                  <MediaPicker 
                     value={formData.image} 
                     onChange={(url) => setFormData({...formData, image: url})}
                     label="Set image"
                  />
               </div>
            </div>
         </div>
      </form>
    </AdminPageLayout>
  );
}
