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
   Settings,
   List,
   HelpCircle,
   Activity,
   Check
} from "lucide-react";

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });
import MediaPicker from "./MediaPicker";
import MediaPickerModal from "./MediaPickerModal";
import GallerySorter from "./GallerySorter";

// Tiny inline image button — opens MediaPickerModal without the full MediaPicker drop-zone UI
function InlinePick({ value, onChange }) {
   const [open, setOpen] = useState(false);
   return (
      <>
         <button
            type="button"
            onClick={() => setOpen(true)}
            className={`h-7 px-2.5 rounded text-[10px] font-bold border transition-colors whitespace-nowrap ${
               value
                  ? "border-[#2271b1] text-[#2271b1] bg-blue-50 hover:bg-blue-100"
                  : "border-gray-200 text-gray-400 bg-white hover:border-[#2271b1] hover:text-[#2271b1]"
            }`}
         >
            {value ? "✓ Change" : "+ Image"}
         </button>
         <MediaPickerModal
            open={open}
            onClose={() => setOpen(false)}
            onSelect={(sel) => { onChange(sel.url); setOpen(false); }}
            title="Pick variant image"
         />
      </>
   );
}

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
      shippingType: "Express",
      images: [],
      seo: { title: "", description: "", ogImage: "" },
      categories: [],
      attributes: [], // { name: "", type: "custom", values: [{ label: "", hex: "", image: "", value: "", variantImage: "" }] }
      variantCombinations: [], // { title: "", price: "", stock: "", sku: "", image: "" }
      stats: [],
      faqs: []
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
                  seo: data.seo || { title: "", description: "", ogImage: "" },
                  attributes: data.attributes || data.variants?.map(v => ({
                     name: v.name,
                     type: v.name.toLowerCase().includes("color") ? "color" : v.name.toLowerCase().includes("size") ? "size" : "custom",
                     values: v.values.map(val => ({
                        label: val.name || val,
                        value: val.name || val,
                        hex: val.hex || "",
                        image: val.image || "",
                        variantImage: ""
                     }))
                  })) || [],
                  variantCombinations: data.variantCombinations || [],
                  stats: data.stats || [],
                  faqs: data.faqs || [],
                  overview: data.overview || "",
                  shippingType: data.shippingType || "Express"
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

   const addAttribute = () => {
      setFormData({
         ...formData,
         attributes: [...(formData.attributes || []), { name: "", type: "custom", values: [] }]
      });
   };

   const addAttributeValue = (aIdx, label) => {
      if (!label) return;
      const newAttrs = [...(formData.attributes || [])];
      const type = newAttrs[aIdx].type;
      newAttrs[aIdx].values.push({
         label,
         value: label,
         hex: type === "color" ? "#000000" : "",
         image: "",
         variantImage: ""
      });
      setFormData({ ...formData, attributes: newAttrs });
   };

   const generateCombinations = () => {
      const attrs = (formData.attributes || []).filter(a => a.name && a.values.length > 0);
      if (attrs.length === 0) return;

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

      const combos = combine(attrs);
      const newCombos = combos.map(c => ({
         title: c.map(v => v.label).join(" / "),
         price: formData.price,
         stock: formData.stock,
         sku: `${formData.sku}-${c.map(v => v.label).join("-")}`.toUpperCase(),
         image: c.find(v => v.variantImage)?.variantImage || ""
      }));

      setFormData({ ...formData, variantCombinations: newCombos });
   };

   const addTemplate = (type) => {
      const templates = {
         size: {
            name: "Size",
            type: "size",
            values: ["XS", "S", "M", "L", "XL"].map(v => ({ label: v, value: v, hex: "", image: "", variantImage: "" }))
         },
         color: {
            name: "Color",
            type: "color",
            values: [
               { label: "Black", value: "Black", hex: "#000000", image: "", variantImage: "" },
               { label: "White", value: "White", hex: "#FFFFFF", image: "", variantImage: "" },
               { label: "Navy", value: "Navy", hex: "#000080", image: "", variantImage: "" },
               { label: "Gray", value: "Gray", hex: "#808080", image: "", variantImage: "" },
               { label: "Red", value: "Red", hex: "#FF0000", image: "", variantImage: "" }
            ]
         },
         material: {
            name: "Material",
            type: "custom",
            values: ["Cotton", "Leather", "Silk", "Wool", "Suede"].map(v => ({ label: v, value: v, hex: "", image: "", variantImage: "" }))
         }
      };
      if (templates[type]) {
         setFormData({
            ...formData,
            attributes: [...(formData.attributes || []), templates[type]]
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
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <div className="text-[12px] text-gray-500 px-1 mt-1 flex items-center gap-1">
                     Permalink: <span className="text-gray-400">pairo.store/product/</span>
                     <input className="border-none bg-transparent outline-none text-[#2271b1] font-mono w-fit min-w-[50px]" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
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
                     onChange={(html) => setFormData({ ...formData, description: html })}
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
                     onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
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
                           { id: "variants", label: "Variants Engine", icon: Layers },
                           { id: "stats", label: "Product Stats", icon: Activity },
                           { id: "faqs", label: "FAQs", icon: HelpCircle },
                           { id: "seo", label: "SEO Settings", icon: Globe }
                        ].map(tab => (
                           <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveTab(tab.id)}
                              className={`p-3.5 text-[13px] text-left border-b border-[#c3c4c7]/30 flex items-center gap-3 transition-colors ${activeTab === tab.id ? "bg-white text-black font-bold border-r-4 border-[#2271b1]" : "text-[#2271b1] hover:bg-[#f0f0f1]"
                                 }`}
                           >
                              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#2271b1]' : 'text-gray-400'}`} /> {tab.label}
                           </button>
                        ))}
                     </div>

                     {/* Tab Panels */}
                     <div className="flex-1 p-8 bg-white overflow-y-auto">
                        {activeTab === "general" && (
                           <div className="space-y-4 max-w-xl">
                              <div className="flex items-center gap-6 py-2 border-b border-gray-50">
                                 <label className="text-[12px] font-bold text-gray-400 uppercase w-40">Regular price</label>
                                 <div className="flex-1 flex items-center gap-2 border border-gray-200 bg-gray-50/50 px-3 py-2 rounded-sm focus-within:border-[#2271b1] transition-colors">
                                    <span className="text-gray-400 text-[13px]">$</span>
                                    <input className="w-full bg-transparent text-[14px] outline-none" placeholder="0.00" value={formData.compareAtPrice} onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })} />
                                 </div>
                              </div>
                              <div className="flex items-center gap-6 py-2 border-b border-gray-50">
                                 <label className="text-[12px] font-bold text-gray-400 uppercase w-40">Sale price</label>
                                 <div className="flex-1 flex items-center gap-2 border border-gray-200 bg-gray-50/50 px-3 py-2 rounded-sm focus-within:border-[#2271b1] transition-colors">
                                    <span className="text-gray-400 text-[13px] font-bold">$</span>
                                    <input className="w-full bg-transparent text-[14px] outline-none font-bold" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                 </div>
                              </div>
                              <div className="flex items-center gap-6 py-2 border-b border-gray-50">
                                 <label className="text-[12px] font-bold text-gray-400 uppercase w-40">Shipping Type</label>
                                 <select className="flex-1 border border-gray-200 bg-gray-50/50 p-2 text-[14px] outline-none rounded-sm focus:border-[#2271b1]" value={formData.shippingType} onChange={(e) => setFormData({ ...formData, shippingType: e.target.value })}>
                                    <option value="Express">Express Shipping</option>
                                    <option value="Standard">Standard Shipping</option>
                                    <option value="Free">Free Shipping</option>
                                    <option value="Priority">Priority Mail</option>
                                 </select>
                              </div>
                           </div>
                        )}

                        {activeTab === "inventory" && (
                           <div className="space-y-4 max-w-xl">
                              <div className="flex items-center gap-6 py-2 border-b border-gray-50">
                                 <label className="text-[12px] font-bold text-gray-400 uppercase w-40">SKU</label>
                                 <input className="flex-1 border border-gray-200 bg-gray-50/50 p-2 text-[14px] outline-none rounded-sm uppercase focus:border-[#2271b1]" placeholder="e.g. PR-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                              </div>
                              <div className="flex items-center gap-6 py-4 border-b border-gray-50">
                                 <label className="text-[12px] font-bold text-gray-400 uppercase w-40">Track Stock</label>
                                 <div className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2271b1] focus:ring-[#2271b1]" checked={formData.manageStock} onChange={(e) => setFormData({ ...formData, manageStock: e.target.checked })} />
                                    <span className="text-[12px] text-gray-500 font-medium">Enable inventory tracking for this product</span>
                                 </div>
                              </div>
                              {formData.manageStock && (
                                 <div className="flex items-center gap-6 py-2">
                                    <label className="text-[12px] font-bold text-gray-400 uppercase w-40">Stock Quantity</label>
                                    <input type="number" className="w-32 border border-gray-200 bg-gray-50/50 p-2 text-[14px] outline-none rounded-sm focus:border-[#2271b1]" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                 </div>
                              )}
                           </div>
                        )}

                        {activeTab === "variants" && (
                           <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                 <p className="text-[13px] font-bold text-gray-700">Variant Attributes</p>
                                 <div className="flex gap-2">
                                    <button type="button" onClick={() => addTemplate("color")} className="text-[11px] font-bold border border-gray-200 px-3 py-1.5 bg-white hover:bg-gray-50 rounded">+ Color</button>
                                    <button type="button" onClick={() => addTemplate("size")} className="text-[11px] font-bold border border-gray-200 px-3 py-1.5 bg-white hover:bg-gray-50 rounded">+ Size</button>
                                    <button type="button" onClick={addAttribute} className="bg-[#2271b1] text-white px-3 py-1.5 rounded font-bold text-[11px] hover:bg-[#135e96]">+ Custom</button>
                                 </div>
                              </div>

                              {(formData.attributes || []).length === 0 && (
                                 <div className="border border-dashed border-gray-200 rounded-lg py-10 text-center">
                                    <p className="text-[12px] text-gray-300">No variants yet. Add Color or Size above.</p>
                                 </div>
                              )}

                              {(formData.attributes || []).map((attr, aIdx) => {
                                 const updateAttr = (key, v) => { const n=[...formData.attributes]; n[aIdx][key]=v; setFormData({...formData,attributes:n}); };
                                 const updateVal = (vIdx, key, v) => { const n=[...formData.attributes]; n[aIdx].values[vIdx][key]=v; setFormData({...formData,attributes:n}); };
                                 const removeVal = (vIdx) => { const n=[...formData.attributes]; n[aIdx].values=n[aIdx].values.filter((_,i)=>i!==vIdx); setFormData({...formData,attributes:n}); };

                                 return (
                                    <div key={aIdx} className="border border-gray-200 rounded-lg bg-white overflow-hidden">

                                       {/* Attribute bar */}
                                       <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
                                          <input className="border border-gray-200 rounded px-2 py-1 text-[12px] font-bold w-32 outline-none focus:border-[#2271b1] bg-white" placeholder="Name" value={attr.name} onChange={e=>updateAttr("name",e.target.value)} />
                                          <select className="border border-gray-200 rounded px-2 py-1 text-[11px] font-bold outline-none text-[#2271b1] bg-white focus:border-[#2271b1]" value={attr.type} onChange={e=>updateAttr("type",e.target.value)}>
                                             <option value="color">Color</option>
                                             <option value="size">Size</option>
                                             <option value="custom">Custom</option>
                                          </select>
                                          <span className="text-[10px] text-gray-400">{(attr.values||[]).length} values</span>
                                          <button type="button" onClick={()=>setFormData({...formData,attributes:formData.attributes.filter((_,i)=>i!==aIdx)})} className="ml-auto text-gray-300 hover:text-red-500 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                       </div>

                                       {/* Table header */}
                                       {(attr.values||[]).length > 0 && (
                                          <div className={`grid px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50/70 border-b border-gray-100 ${ attr.type==="color" ? "grid-cols-[28px_1fr_auto_24px]" : "grid-cols-[1fr_auto_24px]" } gap-3`}>
                                             {attr.type==="color" && <span>SW</span>}
                                             <span>Label</span>
                                             <span>Image</span>
                                             <span/>
                                          </div>
                                       )}

                                       {/* Value rows — fixed single-line height */}
                                       <div className="divide-y divide-gray-50">
                                          {(attr.values||[]).map((val,vIdx)=>(
                                             <div key={vIdx} className={`grid items-center gap-3 px-3 py-2 ${ attr.type==="color" ? "grid-cols-[28px_1fr_auto_24px]" : "grid-cols-[1fr_auto_24px]" }`}>

                                                {/* Swatch (color only) */}
                                                {attr.type==="color" && (
                                                   <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-200 shadow-sm cursor-pointer shrink-0">
                                                      <input type="color" value={val.hex||"#000000"} onChange={e=>updateVal(vIdx,"hex",e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                                      <div className="w-full h-full" style={{backgroundColor:val.hex||"#000000"}} />
                                                   </div>
                                                )}

                                                {/* Label */}
                                                <input className="w-full border border-gray-200 rounded px-2 py-1 text-[12px] outline-none focus:border-[#2271b1] bg-white" placeholder="Label" value={val.label} onChange={e=>{updateVal(vIdx,"label",e.target.value);updateVal(vIdx,"value",e.target.value);}} />

                                                {/* Image — single button only, no drop-zone */}
                                                <InlinePick value={val.variantImage} onChange={url=>updateVal(vIdx,"variantImage",url)} />

                                                {/* Delete */}
                                                <button type="button" onClick={()=>removeVal(vIdx)} className="text-gray-300 hover:text-red-500 p-0.5 shrink-0"><X className="w-3.5 h-3.5" /></button>
                                             </div>
                                          ))}
                                       </div>

                                       {/* Add value */}
                                       <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100">
                                          <input
                                             className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-[12px] outline-none focus:border-[#2271b1] bg-gray-50"
                                             placeholder={attr.type==="color" ? "Color name (e.g. Midnight Black)..." : attr.type==="size" ? "Size (e.g. XS, M, XL)..." : "Value..."}
                                             onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); addAttributeValue(aIdx,e.target.value); e.target.value=""; } }}
                                          />
                                          <button type="button" onClick={e=>{ const i=e.currentTarget.previousSibling; addAttributeValue(aIdx,i.value); i.value=""; }} className="bg-[#2271b1] text-white px-4 py-1.5 rounded text-[11px] font-bold hover:bg-[#135e96] shrink-0">
                                             Add
                                          </button>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}

                        {activeTab === "stats" && (
                           <div className="space-y-8">
                              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                 <div>
                                    <h3 className="text-[14px] font-bold text-gray-800">Product Highlights</h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Showcase key specifications and features with visual icons.</p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, stats: [...(formData.stats || []), { label: "", value: "", icon: "Shield" }] })}
                                    className="bg-[#2271b1] text-white px-4 py-1.5 rounded-sm text-[11px] font-bold shadow-sm hover:bg-[#135e96] uppercase tracking-wider"
                                 >
                                    + Add Stat
                                 </button>
                              </div>
 
                              <div className="grid grid-cols-1 gap-3">
                                 {(formData.stats || []).map((stat, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-4 bg-white p-4 border border-gray-100 rounded-md shadow-sm hover:border-gray-200 transition-all group">
                                       <div className="flex flex-col gap-1 w-32">
                                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Icon</label>
                                          <select
                                             className="w-full bg-gray-50 border border-transparent p-1.5 text-[12px] outline-none rounded focus:bg-white focus:border-[#2271b1] transition-colors"
                                             value={stat.icon}
                                             onChange={(e) => {
                                                const n = [...formData.stats];
                                                n[sIdx].icon = e.target.value;
                                                setFormData({ ...formData, stats: n });
                                             }}
                                          >
                                             <option value="Shield">🛡️ Protection</option>
                                             <option value="Truck">🚚 Shipping</option>
                                             <option value="Zap">⚡ Power</option>
                                             <option value="Package">📦 Packaging</option>
                                             <option value="Globe">🌍 Global</option>
                                             <option value="Star">⭐ Quality</option>
                                             <option value="Layers">📑 Material</option>
                                             <option value="Heart">❤️ Care</option>
                                             <option value="Anchor">⚓ Security</option>
                                             <option value="Award">🏆 Award</option>
                                          </select>
                                       </div>
                                       <div className="flex-1 flex flex-col gap-1">
                                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Label</label>
                                          <input
                                             className="w-full bg-transparent border-b border-gray-100 p-1.5 text-[13px] font-medium outline-none focus:border-[#2271b1] transition-colors"
                                             placeholder="e.g. Composition"
                                             value={stat.label}
                                             onChange={(e) => {
                                                const n = [...formData.stats];
                                                n[sIdx].label = e.target.value;
                                                setFormData({ ...formData, stats: n });
                                             }}
                                          />
                                       </div>
                                       <div className="flex-1 flex flex-col gap-1">
                                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail Value</label>
                                          <input
                                             className="w-full bg-transparent border-b border-gray-100 p-1.5 text-[13px] font-medium outline-none focus:border-[#2271b1] transition-colors"
                                             placeholder="e.g. Organic Cotton"
                                             value={stat.value}
                                             onChange={(e) => {
                                                const n = [...formData.stats];
                                                n[sIdx].value = e.target.value;
                                                setFormData({ ...formData, stats: n });
                                             }}
                                          />
                                       </div>
                                       <button
                                          type="button"
                                          onClick={() => setFormData({ ...formData, stats: formData.stats.filter((_, i) => i !== sIdx) })}
                                          className="text-gray-200 hover:text-red-500 transition-colors p-2"
                                       >
                                          <X className="w-5 h-5" />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
 
                        {activeTab === "faqs" && (
                           <div className="space-y-8">
                              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                 <div>
                                    <h3 className="text-[14px] font-bold text-gray-800">Support FAQs</h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Answer common customer questions for this specific product.</p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, faqs: [...(formData.faqs || []), { question: "", answer: "" }] })}
                                    className="bg-[#2271b1] text-white px-4 py-1.5 rounded-sm text-[11px] font-bold shadow-sm hover:bg-[#135e96] uppercase tracking-wider"
                                 >
                                    + Add FAQ
                                 </button>
                              </div>
 
                              <div className="space-y-4">
                                 {(formData.faqs || []).map((faq, fIdx) => (
                                    <div key={fIdx} className="bg-white border border-gray-100 rounded-md p-5 shadow-sm space-y-4 relative group">
                                       <button
                                          type="button"
                                          onClick={() => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== fIdx) })}
                                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                       >
                                          <X className="w-5 h-5" />
                                       </button>
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question</label>
                                          <input
                                             className="w-full bg-gray-50 border border-transparent p-2.5 text-[13px] font-bold outline-none rounded-sm focus:bg-white focus:border-[#2271b1] transition-all"
                                             placeholder="e.g. How do I wash this garment?"
                                             value={faq.question}
                                             onChange={(e) => {
                                                const n = [...formData.faqs];
                                                n[fIdx].question = e.target.value;
                                                setFormData({ ...formData, faqs: n });
                                             }}
                                          />
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detailed Answer</label>
                                          <textarea
                                             rows={3}
                                             className="w-full bg-gray-50 border border-transparent p-2.5 text-[13px] outline-none rounded-sm focus:bg-white focus:border-[#2271b1] transition-all"
                                             placeholder="Provide a helpful response..."
                                             value={faq.answer}
                                             onChange={(e) => {
                                                const n = [...formData.faqs];
                                                n[fIdx].answer = e.target.value;
                                                setFormData({ ...formData, faqs: n });
                                             }}
                                          />
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
 
                        {activeTab === "seo" && (
                           <div className="space-y-8">
                              <div className="pb-4 border-b border-gray-100">
                                 <h3 className="text-[14px] font-bold text-gray-800">Search Engine Optimization</h3>
                                 <p className="text-[11px] text-gray-400 mt-0.5">Configure how this product appears in search engines and social media.</p>
                              </div>
 
                              <div className="space-y-6 max-w-2xl">
                                 <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Title</label>
                                    <input 
                                       className="w-full bg-white border border-gray-200 p-3 text-[14px] outline-none rounded-sm focus:border-[#2271b1] shadow-sm transition-all" 
                                       placeholder="Product name usually goes here..."
                                       value={formData.seo?.title} 
                                       onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })} 
                                    />
                                    <p className="text-[11px] text-gray-400 italic">Recommended: Under 60 characters.</p>
                                 </div>
 
                                 <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Description</label>
                                    <textarea 
                                       className="w-full bg-white border border-gray-200 p-3 text-[14px] outline-none rounded-sm focus:border-[#2271b1] shadow-sm transition-all" 
                                       rows={4} 
                                       placeholder="Summarize the product for search results..."
                                       value={formData.seo?.description} 
                                       onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })} 
                                    />
                                    <p className="text-[11px] text-gray-400 italic">Recommended: 150-160 characters.</p>
                                 </div>
 
                                 <div className="pt-6 border-t border-gray-100">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Open Graph Image (Social Sharing)</label>
                                    <div className="bg-gray-50/50 p-6 border border-dashed border-gray-200 rounded-md">
                                       <MediaPicker
                                          value={formData.seo?.ogImage}
                                          onChange={(url) => setFormData({ ...formData, seo: { ...formData.seo, ogImage: url } })}
                                          label="Select OG Image"
                                       />
                                       <p className="text-[11px] text-gray-400 mt-4 text-center">Optimized for Facebook, X (Twitter), and WhatsApp (1200x630px recommended).</p>
                                    </div>
                                 </div>
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
                           <button type="button" onClick={() => setFormData({ ...formData, status: formData.status === "Published" ? "Draft" : "Published" })} className="text-[#2271b1] underline text-[11px] ml-auto">Edit</button>
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
                                 setFormData({ ...formData, categories: n });
                              }}
                           /> {cat.name}
                        </label>
                     ))}
                  </div>
               </div>

               <div className="bg-white border border-[#c3c4c7]">
                  <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Product Image</div>
                  <div className="p-4">
                     <MediaPicker
                        value={formData.images?.[0]}
                        onChange={(url) => {
                           const rest = (formData.images || []).slice(1);
                           setFormData({ ...formData, images: [url, ...rest] });
                        }}
                        label=""
                     />
                     <p className="text-[11px] text-[#646970] mt-2 italic">This is the main product image (featured).</p>
                  </div>
               </div>

               <div className="bg-white border border-[#c3c4c7]">
                  <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold text-gray-700">Product Gallery</div>
                  <div className="p-4 space-y-4">
                     {formData.images?.length > 1 && (
                        <GallerySorter
                           images={formData.images.slice(1)}
                           onChange={(newGallery) => setFormData({ ...formData, images: [formData.images[0], ...newGallery] })}
                        />
                     )}
                     <MediaPicker
                        multiple
                        value={formData.images?.slice(1)}
                        onChange={(urls) => {
                           const featured = formData.images?.[0] || "";
                           setFormData({ ...formData, images: [featured, ...urls] });
                        }}
                        label="Add Gallery Images"
                     />
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
