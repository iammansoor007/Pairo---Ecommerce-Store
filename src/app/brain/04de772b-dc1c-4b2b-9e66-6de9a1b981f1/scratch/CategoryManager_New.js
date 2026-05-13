"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, Edit, ExternalLink, ImageIcon, X, Check, FileText } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import Link from "next/link";
// Using Tiptap for full description
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 bg-white border border-gray-200 rounded-b',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-sm ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}><b>B</b></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-sm ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}><i>I</i></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default function CategoryManager({ type = "product", title = "Categories" }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("Bulk actions");
  
  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    slug: "",
    description: "",
    content: "",
    image: "",
    status: "Published",
    isFeatured: false,
    seo: {
      title: "",
      description: "",
      keywords: [],
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noIndex: false,
      noFollow: false
    },
    linkedItems: [], // array of IDs
    type: type
  });

  // Available items for linking
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?type=${type}`);
      const data = await res.json();
      if (res.ok) {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const endpoint = type === 'product' ? '/api/admin/products' : '/api/admin/blogs';
      const res = await fetch(`${endpoint}?status=Published`);
      const data = await res.json();
      if (res.ok) {
         setAvailableItems(Array.isArray(data) ? data : (data.products || []));
      }
    } catch (err) {
       console.error("Failed to fetch available items", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAvailableItems();
  }, [type]);

  const handleOpenNew = () => {
    setFormData({
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
    setIsDrawerOpen(true);
  };

  const handleEdit = (cat) => {
    setFormData({
      ...cat,
      seo: cat.seo || { title: "", description: "", keywords: [], canonicalUrl: "", ogTitle: "", ogDescription: "", ogImage: "", noIndex: false, noFollow: false },
      linkedItems: [], // Initially empty, we don't fetch existing links right now unless we query them. For UI simplicity, we will just manage new links or overwrite.
      type: type
    });
    setIsDrawerOpen(true);
  };

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
        setIsDrawerOpen(false);
        fetchCategories();
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async () => {
     if (bulkAction === "Bulk actions" || selectedIds.length === 0) return;
     if (confirm(`Delete ${selectedIds.length} categories?`)) {
        try {
           for (const id of selectedIds) {
              await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
           }
           setSelectedIds([]);
           fetchCategories();
        } catch (err) {
           console.error("Bulk delete failed:", err);
        }
     }
  };

  const toggleSelect = (id) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
     if (selectedIds.length === categories.length) setSelectedIds([]);
     else setSelectedIds(categories.map(c => c._id));
  };

  const filteredCategories = categories.filter(c => 
     c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = availableItems.filter(i => 
     i.title?.toLowerCase().includes(itemSearchTerm.toLowerCase()) || 
     i.name?.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const breadcrumbs = type === "product" 
    ? [{ label: "WooCommerce", href: "/admin/orders" }, { label: "Categories" }]
    : [{ label: "Blog", href: "/admin/blogs" }, { label: "Categories" }];

  return (
    <AdminPageLayout title={title} breadcrumbs={breadcrumbs}>
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
         <div>
            <h1 className="text-[24px] font-normal text-[#1d2327] mb-1">{title}</h1>
            <p className="text-[13px] text-[#646970]">Manage your {type} categories here.</p>
         </div>
         <button onClick={handleOpenNew} className="bg-[#2271b1] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-[#135e96] flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
         </button>
      </div>

      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden rounded-[4px]">
        {/* Table Controls */}
        <div className="p-3 border-b border-[#c3c4c7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f6f7f7]">
           <div className="flex items-center gap-2">
              <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-[3px] outline-none" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
                 <option>Bulk actions</option>
                 <option>Delete</option>
              </select>
              <button onClick={handleBulkAction} className="border border-[#8c8f94] text-[#3c434a] px-3 py-1 rounded-[3px] text-[13px] font-medium bg-[#f6f7f7] hover:bg-[#f0f0f1]">Apply</button>
           </div>
           <div className="flex items-center gap-2">
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Search categories..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="border border-[#8c8f94] outline-none pl-8 pr-3 py-1 text-[13px] w-64 bg-white focus:border-[#2271b1] rounded-[3px]"
                 />
                 <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" />
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed text-[13px] min-w-[800px]">
            <thead>
              <tr className="border-b border-[#c3c4c7]">
                <th className="px-3 py-2 w-8 text-center"><input type="checkbox" className="w-4 h-4" checked={selectedIds.length > 0 && selectedIds.length === categories.length} onChange={toggleSelectAll} /></th>
                <th className="px-3 py-2 w-16 text-center"><ImageIcon className="w-4 h-4 mx-auto text-[#8c8f94]" /></th>
                <th className="px-3 py-2 font-bold text-[#1d2327]">Name</th>
                <th className="px-3 py-2 font-bold text-[#1d2327] w-48">Slug</th>
                <th className="px-3 py-2 font-bold text-[#1d2327] w-24 text-center">Status</th>
                <th className="px-3 py-2 font-bold text-[#1d2327] w-20 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center italic text-gray-400">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center italic text-gray-400">No categories found.</td></tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id} className={`hover:bg-[#f6f7f7] group transition-colors ${selectedIds.includes(cat._id) ? "bg-[#f0f6fa]" : ""}`}>
                    <td className="px-3 py-4 text-center align-top"><input type="checkbox" className="w-4 h-4" checked={selectedIds.includes(cat._id)} onChange={() => toggleSelect(cat._id)} /></td>
                    <td className="px-3 py-4 text-center align-top">
                       <div className="w-10 h-10 bg-gray-50 border border-[#c3c4c7] rounded-[2px] overflow-hidden mx-auto flex items-center justify-center">
                          {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                       </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col">
                         <span onClick={() => handleEdit(cat)} className="text-[14px] font-bold text-[#2271b1] hover:underline cursor-pointer leading-tight mb-1">{cat.name}</span>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[#2271b1] font-medium">
                            <button onClick={() => handleEdit(cat)} className="hover:text-[#135e96]">Edit</button>
                            <span className="text-[#c3c4c7]">|</span>
                            <button onClick={() => handleDelete(cat._id)} className="text-[#d63638] hover:text-[#bc0b0d]">Delete</button>
                         </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top font-mono text-gray-500">{cat.slug}</td>
                    <td className="px-3 py-4 align-top text-center">
                       <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase ${cat.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {cat.status || "Published"}
                       </span>
                    </td>
                    <td className="px-3 py-4 align-top font-bold text-[#2271b1] text-right">{cat.productCount || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer / Modal for Category Form */}
      {isDrawerOpen && (
         <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-[#f0f2f1] h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
               {/* Drawer Header */}
               <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                  <div>
                     <h2 className="text-[18px] font-semibold text-gray-800">{formData._id ? "Edit Category" : "Add New Category"}</h2>
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full mt-1 inline-block ${type === 'blog' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {type === 'blog' ? 'Blog Mode' : 'Product Mode'}
                     </span>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Drawer Body */}
               <div className="p-6 flex-1 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white p-5 rounded border border-gray-200 shadow-sm space-y-4">
                     <h3 className="font-semibold text-[14px] border-b pb-2">Basic Information</h3>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[12px] font-bold text-gray-700">Name <span className="text-red-500">*</span></label>
                           <input 
                              required
                              className="w-full border border-gray-300 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none px-3 py-2 text-[13px] rounded"
                              value={formData.name}
                              onChange={(e) => {
                                 const name = e.target.value;
                                 const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                                 setFormData({...formData, name, slug: formData._id ? formData.slug : slug}); // only auto-slug if new
                              }}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[12px] font-bold text-gray-700">Slug</label>
                           <input 
                              className="w-full border border-gray-300 focus:border-[#2271b1] outline-none px-3 py-2 text-[13px] rounded font-mono text-gray-600"
                              value={formData.slug}
                              onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-gray-700">Short Description</label>
                        <textarea 
                           rows={2}
                           className="w-full border border-gray-300 focus:border-[#2271b1] outline-none px-3 py-2 text-[13px] rounded resize-none"
                           value={formData.description}
                           onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-gray-700">Full Content</label>
                        <RichTextEditor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
                     </div>
                  </div>

                  {/* Media & Status */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-white p-5 rounded border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-semibold text-[14px] border-b pb-2">Media</h3>
                        <MediaPicker 
                           value={formData.image} 
                           onChange={(url) => setFormData({...formData, image: url})}
                           label="Featured Image"
                        />
                     </div>
                     <div className="bg-white p-5 rounded border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-semibold text-[14px] border-b pb-2">Status & Visibility</h3>
                        <div className="space-y-3">
                           <label className="flex items-center gap-2 text-[13px] text-gray-700">
                              <input type="radio" name="status" checked={formData.status === 'Published'} onChange={() => setFormData({...formData, status: 'Published'})} />
                              Published
                           </label>
                           <label className="flex items-center gap-2 text-[13px] text-gray-700">
                              <input type="radio" name="status" checked={formData.status === 'Draft'} onChange={() => setFormData({...formData, status: 'Draft'})} />
                              Draft
                           </label>
                           <hr className="my-2 border-gray-100" />
                           <label className="flex items-center gap-2 text-[13px] text-gray-700">
                              <input type="checkbox" className="rounded" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} />
                              Featured Category
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Link Items */}
                  <div className="bg-white p-5 rounded border border-gray-200 shadow-sm space-y-4">
                     <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold text-[14px]">Link {type === 'product' ? 'Products' : 'Blogs'}</h3>
                        <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{formData.linkedItems.length} selected</span>
                     </div>
                     <p className="text-[12px] text-gray-500">Select published items to add to this category.</p>
                     
                     <div className="relative mb-2">
                        <input 
                           type="text" 
                           placeholder={`Search ${type}s...`}
                           value={itemSearchTerm}
                           onChange={(e) => setItemSearchTerm(e.target.value)}
                           className="w-full border border-gray-300 px-3 py-1.5 text-[12px] rounded focus:border-[#2271b1] outline-none"
                        />
                     </div>
                     
                     <div className="max-h-48 overflow-y-auto border border-gray-200 rounded divide-y divide-gray-100">
                        {filteredItems.length === 0 ? (
                           <div className="p-4 text-center text-gray-400 text-[12px]">No published items available.</div>
                        ) : (
                           filteredItems.map(item => (
                              <label key={item._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer">
                                 <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-[#2271b1]"
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

                  {/* SEO Meta Box */}
                  <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                     <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-white">
                        <h3 className="font-semibold text-[14px]">SEO Settings (Yoast-style)</h3>
                     </div>
                     <div className="p-5 space-y-5">
                        
                        {/* SEO Preview */}
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-1">
                           <p className="text-[12px] text-gray-500 mb-2 uppercase font-bold tracking-wider">Search Engine Snippet Preview</p>
                           <div className="text-[18px] text-[#1a0dab] truncate font-medium hover:underline cursor-pointer">{formData.seo.title || formData.name || "Category Title"}</div>
                           <div className="text-[13px] text-[#006621] truncate">https://yoursite.com/{type}/category/{formData.slug || "slug"}</div>
                           <div className="text-[13px] text-[#545454] line-clamp-2 mt-1">{formData.seo.description || formData.description || "Provide a meta description to see how this category will appear in search results."}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <div className="flex justify-between">
                                    <label className="text-[12px] font-bold text-gray-700">SEO Title</label>
                                    <span className={`text-[10px] ${formData.seo.title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{formData.seo.title.length}/60</span>
                                 </div>
                                 <input className="w-full border border-gray-300 p-2 text-[13px] rounded focus:border-[#2271b1] outline-none" value={formData.seo.title} onChange={e=>setFormData({...formData, seo: {...formData.seo, title: e.target.value}})} />
                              </div>
                              <div className="space-y-1.5">
                                 <div className="flex justify-between">
                                    <label className="text-[12px] font-bold text-gray-700">Meta Description</label>
                                    <span className={`text-[10px] ${formData.seo.description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{formData.seo.description.length}/160</span>
                                 </div>
                                 <textarea className="w-full border border-gray-300 p-2 text-[13px] rounded focus:border-[#2271b1] outline-none resize-none" rows={3} value={formData.seo.description} onChange={e=>setFormData({...formData, seo: {...formData.seo, description: e.target.value}})} />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-bold text-gray-700">Canonical URL</label>
                                 <input className="w-full border border-gray-300 p-2 text-[13px] rounded focus:border-[#2271b1] outline-none font-mono" placeholder="https://" value={formData.seo.canonicalUrl} onChange={e=>setFormData({...formData, seo: {...formData.seo, canonicalUrl: e.target.value}})} />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-bold text-gray-700">Open Graph Title (Facebook/X)</label>
                                 <input className="w-full border border-gray-300 p-2 text-[13px] rounded focus:border-[#2271b1] outline-none" value={formData.seo.ogTitle} onChange={e=>setFormData({...formData, seo: {...formData.seo, ogTitle: e.target.value}})} />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[12px] font-bold text-gray-700">Open Graph Description</label>
                                 <textarea className="w-full border border-gray-300 p-2 text-[13px] rounded focus:border-[#2271b1] outline-none resize-none" rows={2} value={formData.seo.ogDescription} onChange={e=>setFormData({...formData, seo: {...formData.seo, ogDescription: e.target.value}})} />
                              </div>
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                                 <label className="flex items-center gap-2 text-[12px] font-medium text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300" checked={formData.seo.noIndex} onChange={e=>setFormData({...formData, seo: {...formData.seo, noIndex: e.target.checked}})} />
                                    No Index (Hide from search engines)
                                 </label>
                                 <label className="flex items-center gap-2 text-[12px] font-medium text-gray-700 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300" checked={formData.seo.noFollow} onChange={e=>setFormData({...formData, seo: {...formData.seo, noFollow: e.target.checked}})} />
                                    No Follow (Don't follow links)
                                 </label>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Bottom Padding for Sticky Footer */}
                  <div className="h-10"></div>
               </div>

               {/* Drawer Footer */}
               <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors">
                     Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={saving} className="bg-[#2271b1] text-white px-6 py-2 rounded text-[13px] font-bold hover:bg-[#135e96] transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm">
                     {saving && <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>}
                     {saving ? "Saving..." : "Save Category"}
                  </button>
               </div>
            </div>
         </div>
      )}

    </AdminPageLayout>
  );
}
