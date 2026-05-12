"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { 
  ChevronDown,
  Image as ImageIcon, 
  Plus,
  X,
  Package,
  Truck,
  Zap,
  Globe,
  Info,
  Layers,
  Settings
} from "lucide-react";

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

export default function ProductForm({ productId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(productId ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    status: "Draft",
    isFeatured: false,
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "",
    manageStock: true,
    images: [],
    seo: { title: "", description: "" },
    categories: [],
    variants: [], // { name: "", values: [] }
    variantCombinations: [] // { title: "", price: "", stock: "", sku: "" }
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));

    if (productId) {
      fetch(`/api/admin/products?id=${productId}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            images: data.images || [],
            categories: data.categories || [],
            seo: data.seo || { title: "", description: "" },
            variants: data.variants || [],
            variantCombinations: data.variantCombinations || []
          });
          setLoading(false);
        });
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productId ? { ...formData, id: productId } : formData)
      });
      if (res.ok) router.push("/admin/products");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), { name: "", values: [] }]
    });
  };

  const addOption = (vIdx, option) => {
    if (!option) return;
    const newVariants = [...(formData.variants || [])];
    if (!newVariants[vIdx].values.includes(option)) {
      newVariants[vIdx].values.push(option);
      setFormData({ ...formData, variants: newVariants });
    }
  };

  const generateCombinations = () => {
    const variants = (formData.variants || []).filter(v => v.name && v.values.length > 0);
    if (variants.length === 0) return;

    const combine = (arr) => {
      if (arr.length === 0) return [[]];
      const result = [];
      const rest = combine(arr.slice(1));
      for (const val of arr[0].values) {
        for (const r of rest) {
          result.push([val, ...r]);
        }
      }
      return result;
    };

    const combos = combine(variants);
    const newCombos = combos.map(c => ({
      title: c.join(" / "),
      price: formData.price,
      stock: formData.stock,
      sku: `${formData.sku}-${c.join("-")}`.toUpperCase()
    }));

    setFormData({ ...formData, variantCombinations: newCombos });
  };

  const addTemplate = (type) => {
    const templates = {
      size: { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
      color: { name: "Color", values: ["Black", "White", "Navy", "Gray", "Red"] },
      material: { name: "Material", values: ["Cotton", "Leather", "Silk", "Wool", "Suede"] }
    };
    if (templates[type]) {
      setFormData({
        ...formData,
        variants: [...(formData.variants || []), templates[type]]
      });
    }
  };

  if (loading) return <div className="p-10 text-[13px] font-medium text-gray-500">Loading editor...</div>;

  return (
    <div className="font-sans text-[#3c434a] bg-[#f0f2f1] min-h-screen p-4">
      {/* WP Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-[23px] font-normal text-[#1d2327]">{productId ? "Edit Product" : "Add New Product"}</h1>
        <button type="button" onClick={() => router.push("/admin/products/new")} className="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-[3px] text-[13px] font-medium bg-white hover:bg-[#f0f6fa]">Add New</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start max-w-[1200px]">
        {/* Main Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="space-y-1">
             <input 
               required
               placeholder="Enter title here"
               className="w-full border border-[#c3c4c7] outline-none px-3 py-2 text-[20px] bg-white shadow-inner font-semibold"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
             />
             <div className="text-[12px] text-gray-500 px-1 mt-1 flex items-center gap-1">
                Permalink: <span className="text-gray-400">pairo.store/product/</span>
                <input className="border-none bg-transparent outline-none text-[#2271b1] font-mono w-fit min-w-[50px]" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
             </div>
          </div>

          {/* Long Description Meta Box with Tiptap */}
          <div className="bg-white border border-[#c3c4c7]">
             <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-1 flex items-center justify-between">
                <div className="flex gap-2">
                   <button type="button" className="p-1 px-3 bg-white border border-[#c3c4c7] border-b-white -mb-[5px] text-[12px] font-bold z-10">Visual</button>
                   <button type="button" className="p-1 px-3 text-[12px] text-gray-400">Text</button>
                </div>
                <button type="button" className="text-[12px] text-[#2271b1] hover:text-black font-medium">Add Media</button>
             </div>
             <TiptapEditor 
               content={formData.description} 
               onChange={(html) => setFormData({...formData, description: html})} 
             />
          </div>

          {/* Short Description Meta Box */}
          <div className="bg-white border border-[#c3c4c7]">
             <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold flex items-center gap-2 text-gray-700">
                <Info className="w-4 h-4 text-gray-400" /> Product Short Description
             </div>
             <textarea 
               rows={4}
               className="w-full p-4 outline-none text-[14px] leading-relaxed italic text-gray-600 bg-[#fdfdfd]"
               placeholder="Write a brief excerpt..."
               value={formData.shortDescription}
               onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
             />
          </div>

          {/* Product Data Meta Box */}
          <div className="bg-white border border-[#c3c4c7]">
             <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold flex items-center justify-between text-gray-700">
                <span>Product Data — {(formData.variants || []).length > 0 ? "Variable product" : "Simple product"}</span>
             </div>
             <div className="flex min-h-[400px]">
                {/* Vertical Tabs */}
                <div className="w-44 bg-[#f6f7f7] border-r border-[#c3c4c7] flex flex-col shrink-0">
                   {[
                      { id: "general", label: "General", icon: Zap },
                      { id: "inventory", label: "Inventory", icon: Package },
                      { id: "variants", label: "Attributes", icon: Layers },
                      { id: "combinations", label: "Variations", icon: Settings },
                      { id: "seo", label: "SEO Settings", icon: Globe }
                   ].map(tab => (
                      <button 
                         key={tab.id}
                         type="button"
                         onClick={() => setActiveTab(tab.id)}
                         className={`p-3.5 text-[13px] text-left border-b border-[#c3c4c7]/30 flex items-center gap-3 transition-colors ${
                            activeTab === tab.id ? "bg-white text-black font-bold border-r-4 border-[#2271b1]" : "text-[#2271b1] hover:bg-[#f0f0f1]"
                         }`}
                      >
                         <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#2271b1]' : 'text-gray-400'}`} /> {tab.label}
                      </button>
                   ))}
                </div>

                {/* Tab Panels */}
                <div className="flex-1 p-8 bg-white">
                   {activeTab === "general" && (
                      <div className="space-y-6 max-w-lg">
                         <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-[13px] font-medium">Regular price (Original $)</label>
                            <input className="col-span-2 border border-[#8c8f94] p-1.5 text-[14px] outline-none" value={formData.compareAtPrice} onChange={(e) => setFormData({...formData, compareAtPrice: e.target.value})} />
                         </div>
                         <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-[13px] font-medium">Sale price (Current Pay $)</label>
                            <input className="col-span-2 border border-[#8c8f94] p-1.5 text-[14px] outline-none font-bold text-black" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                         </div>
                      </div>
                   )}

                   {activeTab === "inventory" && (
                      <div className="space-y-6 max-w-lg">
                         <div className="grid grid-cols-3 items-center gap-4">
                            <label className="text-[13px] font-medium">SKU</label>
                            <input className="col-span-2 border border-[#8c8f94] p-1.5 text-[14px] outline-none uppercase" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                         </div>
                         <div className="grid grid-cols-3 items-center gap-4 pt-4">
                            <label className="text-[13px] font-medium">Manage stock?</label>
                            <input type="checkbox" className="w-4 h-4" checked={formData.manageStock} onChange={(e) => setFormData({...formData, manageStock: e.target.checked})} />
                         </div>
                         {formData.manageStock && (
                            <div className="grid grid-cols-3 items-center gap-4">
                               <label className="text-[13px] font-medium">Stock qty</label>
                               <input type="number" className="col-span-2 border border-[#8c8f94] p-1.5 text-[14px] outline-none" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                            </div>
                         )}
                      </div>
                   )}

                   {activeTab === "variants" && (
                      <div className="space-y-6">
                         <div className="flex gap-2 mb-4">
                            <button type="button" onClick={() => addTemplate("size")} className="text-[11px] font-bold border border-[#c3c4c7] px-3 py-1 bg-[#f6f7f7] hover:bg-white rounded">+ Add Size</button>
                            <button type="button" onClick={() => addTemplate("color")} className="text-[11px] font-bold border border-[#c3c4c7] px-3 py-1 bg-[#f6f7f7] hover:bg-white rounded">+ Add Color</button>
                            <button type="button" onClick={() => addTemplate("material")} className="text-[11px] font-bold border border-[#c3c4c7] px-3 py-1 bg-[#f6f7f7] hover:bg-white rounded">+ Add Material</button>
                            <button type="button" onClick={addVariant} className="text-[11px] font-bold border border-[#c3c4c7] px-3 py-1 bg-[#f6f7f7] hover:bg-white rounded ml-auto text-[#2271b1]">Custom Attribute</button>
                         </div>

                         {(formData.variants || []).map((v, vIdx) => (
                            <div key={vIdx} className="border border-[#c3c4c7] p-4 bg-[#f8f9fa] rounded-sm relative">
                               <button type="button" onClick={() => setFormData({...formData, variants: (formData.variants || []).filter((_, i) => i !== vIdx)})} className="absolute top-2 right-2 text-gray-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                               <div className="grid grid-cols-4 gap-4 mb-3">
                                  <div className="col-span-1">
                                     <label className="text-[11px] font-bold uppercase text-gray-400">Name</label>
                                     <input className="w-full border border-[#8c8f94] p-1.5 text-[13px]" placeholder="e.g. Size" value={v.name} onChange={(e) => {
                                        const n = [...(formData.variants || [])];
                                        n[vIdx].name = e.target.value;
                                        setFormData({...formData, variants: n});
                                     }} />
                                  </div>
                                  <div className="col-span-3">
                                     <label className="text-[11px] font-bold uppercase text-gray-400">Values</label>
                                     <div className="flex flex-wrap gap-2 mt-1">
                                        {(v.values || []).map((opt, oIdx) => (
                                           <span key={oIdx} className="bg-white border border-[#c3c4c7] px-2 py-0.5 text-[12px] flex items-center gap-2 rounded">
                                              {opt} <button type="button" onClick={() => {
                                                 const n = [...(formData.variants || [])];
                                                 n[vIdx].values = (n[vIdx].values || []).filter((_, i) => i !== oIdx);
                                                 setFormData({...formData, variants: n});
                                              }}><X className="w-3 h-3 text-gray-400 hover:text-red-600" /></button>
                                           </span>
                                        ))}
                                        <input 
                                           className="border-none bg-transparent outline-none text-[13px] py-0.5 w-24"
                                           placeholder="Type and press Enter"
                                           onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                 e.preventDefault();
                                                 addOption(vIdx, e.target.value);
                                                 e.target.value = "";
                                              }
                                           }}
                                        />
                                     </div>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}

                   {activeTab === "combinations" && (
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-gray-50 p-3 border border-dashed border-gray-200">
                            <span className="text-[12px] text-gray-500">Generate all possible combinations from your attributes above.</span>
                            <button type="button" onClick={generateCombinations} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[12px] font-bold shadow-sm">Generate Variations</button>
                         </div>

                         <div className="space-y-2 overflow-y-auto max-h-[400px]">
                            {(formData.variantCombinations || []).map((combo, cIdx) => (
                               <div key={cIdx} className="border border-[#c3c4c7] p-3 bg-white hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[13px] font-bold text-gray-700">{combo.title}</span>
                                     <button type="button" onClick={() => setFormData({...formData, variantCombinations: (formData.variantCombinations || []).filter((_, i) => i !== cIdx)})} className="text-red-600 text-[11px] underline">Remove</button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                     <input className="border border-gray-300 p-1 text-[12px]" placeholder="Price" value={combo.price} onChange={(e) => {
                                        const n = [...(formData.variantCombinations || [])];
                                        n[cIdx].price = e.target.value;
                                        setFormData({...formData, variantCombinations: n});
                                     }} />
                                     <input className="border border-gray-300 p-1 text-[12px]" placeholder="Stock" value={combo.stock} onChange={(e) => {
                                        const n = [...(formData.variantCombinations || [])];
                                        n[cIdx].stock = e.target.value;
                                        setFormData({...formData, variantCombinations: n});
                                     }} />
                                     <input className="border border-gray-300 p-1 text-[12px]" placeholder="SKU" value={combo.sku} onChange={(e) => {
                                        const n = [...(formData.variantCombinations || [])];
                                        n[cIdx].sku = e.target.value;
                                        setFormData({...formData, variantCombinations: n});
                                     }} />
                                  </div>
                                </div>
                            ))}
                         </div>
                      </div>
                   )}

                   {activeTab === "seo" && (
                      <div className="space-y-6 max-w-lg">
                         <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">SEO Meta Title</label>
                            <input className="w-full border border-[#8c8f94] p-2 text-[14px] outline-none" value={formData.seo?.title} onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: e.target.value}})} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[13px] font-bold text-gray-700">Meta Description</label>
                            <textarea className="w-full border border-[#8c8f94] p-2 text-[14px] outline-none" rows={3} value={formData.seo?.description} onChange={(e) => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})} />
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Publish</div>
              <div className="p-3 space-y-4 text-[13px]">
                 <div className="flex justify-between items-center">
                    <button type="button" onClick={handleSubmit} className="border border-[#c3c4c7] px-3 py-1.5 rounded-[3px] bg-[#f6f7f7] hover:bg-[#f0f0f1] text-[12px] font-medium">Save Draft</button>
                    <button type="button" className="text-[#2271b1] underline text-[12px]">Preview</button>
                 </div>
                 <div className="space-y-3 py-3 border-y border-gray-100">
                    <p className="flex items-center gap-2">
                       <span className="text-gray-400">Status:</span> 
                       <span className={`font-bold ${formData.status === 'Published' ? 'text-green-600' : 'text-orange-600'}`}>{formData.status}</span> 
                       <button type="button" onClick={() => setFormData({...formData, status: formData.status === "Published" ? "Draft" : "Published"})} className="text-[#2271b1] underline text-[11px] ml-auto">Edit</button>
                    </p>
                    <p className="flex items-center gap-2">
                       <span className="text-gray-400">Visibility:</span> 
                       <span className="font-bold">Public</span> 
                       <button type="button" className="text-[#2271b1] underline text-[11px] ml-auto">Edit</button>
                    </p>
                 </div>
                 <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] -mx-3 -mb-3 p-3 flex justify-between items-center">
                    <button type="button" onClick={() => router.push("/admin/trash")} className="text-red-600 underline text-[12px] font-medium">Move to Trash</button>
                    <button type="submit" disabled={saving} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] font-bold hover:bg-[#135e96] shadow-sm">
                       {saving ? "Saving..." : (productId ? "Update" : "Publish")}
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Product Categories</div>
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                 {(categories || []).map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 text-[13px] cursor-pointer hover:text-[#2271b1]">
                       <input 
                         type="checkbox" 
                         className="rounded-none border-gray-400"
                         checked={(formData.categories || []).includes(cat._id)}
                         onChange={(e) => {
                            const n = e.target.checked ? [...(formData.categories || []), cat._id] : (formData.categories || []).filter(id => id !== cat._id);
                            setFormData({...formData, categories: n});
                         }}
                       /> {cat.name}
                    </label>
                 ))}
              </div>
           </div>

           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Product Image</div>
              <div className="p-4 space-y-3">
                 <div onClick={() => {
                    const u = prompt("Enter Image URL:");
                    if (u) setFormData({...formData, images: [u, ...(formData.images || [])]});
                 }} className="aspect-square bg-[#f8f9fa] border-2 border-dashed border-[#c3c4c7] flex flex-col items-center justify-center cursor-pointer text-[#2271b1] hover:bg-gray-100 group transition-all">
                    {formData.images?.[0] ? <img src={formData.images[0]} className="w-full h-full object-cover shadow-sm" alt="" /> : <><ImageIcon className="w-8 h-8 mb-2 text-gray-300 group-hover:scale-110 transition-transform" /><span className="text-[12px] underline font-medium">Set product image</span></>}
                 </div>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
