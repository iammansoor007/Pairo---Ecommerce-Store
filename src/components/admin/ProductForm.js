"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Globe, 
  Box, 
  Tag, 
  Image as ImageIcon, 
  Check,
  Plus,
  X
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProductForm({ productId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(productId ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    name: "",
    category: "Men",
    price: "",
    oldPrice: "",
    inventory: 0,
    image: "",
    image2: "",
    details: "",
    type: "newArrival",
    colors: [],
    sizes: [],
    seo: { title: "", description: "", keywords: [] },
    faqs: []
  });

  useEffect(() => {
    if (productId) {
      fetch(`/api/admin/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          setFormData(data);
          setLoading(false);
        });
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = productId ? "PUT" : "POST";
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push("/admin/products");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-20 bg-gray-100 rounded-3xl"/><div className="h-96 bg-gray-100 rounded-3xl"/></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => router.back()} className="p-4 bg-white border border-black/5 rounded-2xl hover:bg-black hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter">{productId ? "Edit Product" : "New Product"}</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/30 mt-1">{productId ? `Editing resource ID: ${productId}` : "Create a new resource in the catalog"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="px-8 py-4 bg-white border border-black/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black">Save Draft</button>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-3 bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/80 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {saving ? "Processing..." : (
              <><Save className="w-4 h-4" /> {productId ? "Update Product" : "Publish Product"}</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
            {[
              { id: "general", name: "General Info", icon: Box },
              { id: "seo", name: "SEO Settings", icon: Globe },
              { id: "details", name: "Product Details", icon: Tag },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm space-y-8">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Product Name</label>
                  <input 
                    required
                    className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all"
                    placeholder="Enter product title..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Category</label>
                    <select 
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[11px] font-bold uppercase tracking-widest outline-none transition-all"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Men</option>
                      <option>Women</option>
                      <option>Coats</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Listing Type</label>
                    <select 
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[11px] font-bold uppercase tracking-widest outline-none transition-all"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="newArrival">New Arrival</option>
                      <option value="topSelling">Top Selling</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Regular Price ($)</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Sale Price ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({...formData, oldPrice: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Stock Quantity</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all"
                      value={formData.inventory}
                      onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">SEO Meta Title</label>
                  <input 
                    className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all"
                    placeholder="Search engine optimized title..."
                    value={formData.seo?.title || ""}
                    onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Meta Description</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all resize-none"
                    placeholder="Brief summary for search results..."
                    value={formData.seo?.description || ""}
                    onChange={(e) => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})}
                  />
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Product Description</label>
                  <textarea 
                    rows={8}
                    className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-2xl p-5 text-[13px] font-bold tracking-tight outline-none transition-all resize-none"
                    placeholder="Detailed product story and specifications..."
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                <ImageIcon className="w-4 h-4 text-black/20" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Product Media</h3>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/20 ml-1">Primary Image URL</label>
                    <input 
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-xl p-3 text-[10px] font-bold outline-none transition-all"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                 </div>
                 {formData.image && (
                   <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/5">
                      <img src={formData.image} className="object-cover w-full h-full" alt="Preview" />
                   </div>
                 )}
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/20 ml-1">Secondary Image URL</label>
                    <input 
                      className="w-full bg-gray-50 border border-transparent focus:border-black/10 focus:bg-white rounded-xl p-3 text-[10px] font-bold outline-none transition-all"
                      value={formData.image2}
                      onChange={(e) => setFormData({...formData, image2: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                <Settings className="w-4 h-4 text-black/20" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Publish Status</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Status:</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Published</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Visibility:</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Public</span>
                 </div>
                 <button type="button" className="w-full py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3">
                    <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                 </button>
              </div>
           </div>
        </div>
      </div>
    </form>
  );
}
