"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Settings, 
  Package, 
  Truck, 
  Zap,
  Globe,
  ListTree,
  ChevronDown,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "",
    manageStock: true,
    weight: "",
    dimensions: { l: "", w: "", h: "" },
    category: "",
    images: [],
    status: "Draft",
    slug: "",
    seo: { title: "", description: "" },
    variants: [] // Array of { name: "Size", values: ["S", "M"] }
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", values: [""] }]
    });
  };

  const updateVariantName = (index, name) => {
    const newVariants = [...formData.variants];
    newVariants[index].name = name;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariantValue = (vIndex) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].values.push("");
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariantValue = (vIndex, valIndex, value) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].values[valIndex] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) router.push("/admin/products");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-[#3c434a] pb-20">
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content (Left) */}
        <div className="lg:col-span-3 space-y-5">
           <input 
             required
             placeholder="Product name"
             className="w-full border border-[#c3c4c7] focus:border-[#2271b1] outline-none px-3 py-2 text-[18px] font-medium bg-white"
             value={formData.name}
             onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
           />

           {/* Description Meta Box */}
           <div className="bg-white border border-[#c3c4c7] shadow-sm">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Product Description
              </div>
              <textarea 
                rows={12}
                className="w-full p-4 outline-none text-[14px] leading-relaxed"
                placeholder="Enter product description here..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
           </div>

           {/* Product Data Meta Box (The WooCommerce/Shopify Engine) */}
           <div className="bg-white border border-[#c3c4c7] shadow-sm">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#8c8f94]" /> Product Data
                 </div>
                 <select className="bg-transparent text-[12px] border-none outline-none font-normal">
                    <option>Variable product</option>
                    <option>Simple product</option>
                 </select>
              </div>
              <div className="flex min-h-[400px]">
                 {/* Tabs Sidebar */}
                 <div className="w-44 bg-[#f6f7f7] border-r border-[#c3c4c7]">
                    {[
                       { id: "general", label: "General", icon: Zap },
                       { id: "inventory", label: "Inventory", icon: Package },
                       { id: "shipping", label: "Shipping", icon: Truck },
                       { id: "variants", label: "Variants", icon: ListTree },
                       { id: "seo", label: "SEO", icon: Globe }
                    ].map(tab => (
                       <div 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`p-3 text-[13px] font-medium flex items-center gap-2 cursor-pointer border-b border-[#c3c4c7]/30 transition-all ${
                             activeTab === tab.id 
                               ? "bg-white border-r-4 border-[#2271b1] text-[#2271b1] font-bold" 
                               : "text-[#2271b1] hover:bg-white"
                          }`}
                       >
                          <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#2271b1]" : "text-[#8c8f94]"}`} />
                          {tab.label}
                       </div>
                    ))}
                 </div>

                 {/* Tab Panels */}
                 <div className="flex-1 p-8">
                    {activeTab === "general" && (
                       <div className="space-y-6 max-w-2xl">
                          <div className="grid grid-cols-3 items-center gap-4">
                             <label className="text-[13px] font-bold text-[#1d2327]">Regular price ($)</label>
                             <input 
                                type="number"
                                className="col-span-2 border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                             />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                             <label className="text-[13px] font-bold text-[#1d2327]">Sale price ($)</label>
                             <input 
                                type="number"
                                className="col-span-2 border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                value={formData.compareAtPrice}
                                onChange={(e) => setFormData({...formData, compareAtPrice: e.target.value})}
                             />
                          </div>
                       </div>
                    )}

                    {activeTab === "inventory" && (
                       <div className="space-y-6 max-w-2xl">
                          <div className="grid grid-cols-3 items-center gap-4">
                             <label className="text-[13px] font-bold text-[#1d2327]">SKU</label>
                             <input 
                                className="col-span-2 border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                             />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                             <label className="text-[13px] font-bold text-[#1d2327]">Manage stock?</label>
                             <div className="col-span-2 flex items-center gap-2">
                                <input 
                                   type="checkbox"
                                   checked={formData.manageStock}
                                   onChange={(e) => setFormData({...formData, manageStock: e.target.checked})}
                                />
                                <span className="text-[13px]">Enable stock management at product level</span>
                             </div>
                          </div>
                          {formData.manageStock && (
                             <div className="grid grid-cols-3 items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[13px] font-bold text-[#1d2327]">Stock quantity</label>
                                <input 
                                   type="number"
                                   className="col-span-2 border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                   value={formData.stock}
                                   onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                />
                             </div>
                          )}
                       </div>
                    )}

                    {activeTab === "shipping" && (
                       <div className="space-y-6 max-w-2xl">
                          <div className="grid grid-cols-3 items-center gap-4">
                             <label className="text-[13px] font-bold text-[#1d2327]">Weight (kg)</label>
                             <input 
                                type="number"
                                className="col-span-2 border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                value={formData.weight}
                                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                             />
                          </div>
                          <div className="grid grid-cols-3 items-start gap-4">
                             <label className="text-[13px] font-bold text-[#1d2327] pt-2">Dimensions (cm)</label>
                             <div className="col-span-2 grid grid-cols-3 gap-2">
                                <input placeholder="Length" className="border border-[#8c8f94] p-1.5 text-[14px] outline-none" value={formData.dimensions.l} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, l: e.target.value}})} />
                                <input placeholder="Width" className="border border-[#8c8f94] p-1.5 text-[14px] outline-none" value={formData.dimensions.w} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, w: e.target.value}})} />
                                <input placeholder="Height" className="border border-[#8c8f94] p-1.5 text-[14px] outline-none" value={formData.dimensions.h} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions, h: e.target.value}})} />
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === "variants" && (
                       <div className="space-y-6">
                          <div className="flex items-center justify-between">
                             <h3 className="text-[14px] font-bold text-[#1d2327]">Product Variants</h3>
                             <button 
                               type="button"
                               onClick={addVariant}
                               className="border border-[#2271b1] text-[#2271b1] px-4 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa]"
                             >
                                Add Options (Size, Color, etc.)
                             </button>
                          </div>
                          
                          <div className="space-y-4">
                             {formData.variants.map((v, vIdx) => (
                                <div key={vIdx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-4 relative group">
                                   <button 
                                      type="button"
                                      onClick={() => removeVariant(vIdx)}
                                      className="absolute top-2 right-2 p-1 text-[#d63638] opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                   <div className="grid grid-cols-4 gap-4 items-start">
                                      <div className="space-y-1">
                                         <label className="text-[12px] font-bold uppercase text-[#8c8f94]">Option Name</label>
                                         <input 
                                            placeholder="e.g. Size"
                                            className="w-full border border-[#c3c4c7] p-1.5 text-[13px] outline-none"
                                            value={v.name}
                                            onChange={(e) => updateVariantName(vIdx, e.target.value)}
                                         />
                                      </div>
                                      <div className="col-span-3 space-y-1">
                                         <label className="text-[12px] font-bold uppercase text-[#8c8f94]">Values</label>
                                         <div className="flex flex-wrap gap-2">
                                            {v.values.map((val, valIdx) => (
                                               <input 
                                                  key={valIdx}
                                                  placeholder="e.g. Small"
                                                  className="border border-[#c3c4c7] p-1.5 text-[13px] outline-none w-24"
                                                  value={val}
                                                  onChange={(e) => updateVariantValue(vIdx, valIdx, e.target.value)}
                                               />
                                            ))}
                                            <button 
                                              type="button"
                                              onClick={() => addVariantValue(vIdx)}
                                              className="p-1.5 border border-dashed border-[#8c8f94] rounded-sm text-[#8c8f94] hover:border-[#2271b1] hover:text-[#2271b1]"
                                            >
                                               <Plus className="w-4 h-4" />
                                            </button>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === "seo" && (
                       <div className="space-y-6 max-w-2xl">
                          <div className="space-y-1">
                             <label className="text-[13px] font-bold text-[#1d2327]">SEO Meta Title</label>
                             <input 
                                className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                placeholder={formData.name || "Product Title"}
                                value={formData.seo.title}
                                onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})}
                             />
                             <p className="text-[12px] text-[#646970] italic">The title that appears in search results.</p>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[13px] font-bold text-[#1d2327]">SEO Meta Description</label>
                             <textarea 
                                rows={4}
                                className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                                value={formData.seo.description}
                                onChange={(e) => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})}
                             />
                             <p className="text-[12px] text-[#646970] italic">Brief summary of the page for search engines.</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-5">
           {/* Publish Box */}
           <div className="bg-white border border-[#c3c4c7] shadow-sm">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Publish
              </div>
              <div className="p-4 space-y-4">
                 <div className="text-[13px] space-y-2">
                    <p>Status: <span className="font-bold">{formData.status}</span> <span className="text-[#2271b1] cursor-pointer hover:underline ml-2">Edit</span></p>
                    <p>Visibility: <span className="font-bold">Public</span> <span className="text-[#2271b1] cursor-pointer hover:underline ml-2">Edit</span></p>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f1]">
                    <button type="button" className="text-[#d63638] text-[13px] hover:underline">Move to Trash</button>
                    <button 
                       disabled={loading}
                       className="bg-[#2271b1] text-white px-4 py-2 rounded-sm text-[13px] font-bold hover:bg-[#135e96] transition-all"
                    >
                       {loading ? "Publishing..." : "Publish"}
                    </button>
                 </div>
              </div>
           </div>

           {/* Categories Box */}
           <div className="bg-white border border-[#c3c4c7] shadow-sm">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Product categories
              </div>
              <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                 {categories.map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 text-[13px] cursor-pointer hover:text-[#2271b1]">
                       <input 
                         type="radio" 
                         name="category"
                         className="border-[#8c8f94]" 
                         onChange={() => setFormData({...formData, category: cat.name})}
                       />
                       {cat.name}
                    </label>
                 ))}
                 {categories.length === 0 && <p className="text-[12px] text-black/30 italic">No categories found.</p>}
              </div>
              <div className="p-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                 <Link href="/admin/categories" className="text-[12px] text-[#2271b1] hover:underline font-medium">+ Add new category</Link>
              </div>
           </div>

           {/* Product Image Box */}
           <div className="bg-white border border-[#c3c4c7] shadow-sm">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Product image
              </div>
              <div className="p-4">
                 <div className="aspect-square bg-[#f0f0f1] border-2 border-dashed border-[#c3c4c7] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-all text-[#2271b1]">
                    <ImageIcon className="w-8 h-8 text-[#8c8f94] mb-2" />
                    <span className="text-[13px] font-medium underline">Set product image</span>
                 </div>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
