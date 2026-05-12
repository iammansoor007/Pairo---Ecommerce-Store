"use client";

import { useState, useEffect, use } from "react";
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Settings, 
  Package, 
  Truck, 
  Zap,
  Globe,
  ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProduct({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "",
    category: "",
    images: [],
    status: "Published",
    slug: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products?id=${id}`),
          fetch("/api/admin/categories")
        ]);
        
        const [product, cats] = await Promise.all([
          prodRes.json(),
          catRes.json()
        ]);

        if (prodRes.ok) {
           // Find the specific product if the API returns an array
           const p = Array.isArray(product) ? product.find(item => item._id === id) : product;
           if (p) {
             setFormData({
               ...p,
               price: p.price || "",
               compareAtPrice: p.compareAtPrice || "",
               stock: p.inventory?.stock || "",
               sku: p.sku || ""
             });
           }
        }
        if (catRes.ok) setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id })
      });
      if (res.ok) router.push("/admin/products");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-[13px]">Loading product data...</div>;

  return (
    <div className="font-sans text-[#3c434a]">
      <div className="flex items-center gap-4 mb-5">
        <Link href="/admin/products" className="text-[#2271b1] hover:text-[#135e96]"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-[23px] font-normal text-[#1d2327]">Edit Product</h1>
        <Link href="/admin/products/new" className="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-md text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">
          Add New
        </Link>
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

           <div className="bg-white border border-[#c3c4c7]">
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

           {/* Product Data Meta Box */}
           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold flex items-center gap-2">
                 <Settings className="w-4 h-4 text-[#8c8f94]" /> Product Data
              </div>
              <div className="flex min-h-[300px]">
                 <div className="w-40 bg-[#f6f7f7] border-r border-[#c3c4c7]">
                    <div className="p-3 bg-white border-r-4 border-[#2271b1] text-[13px] font-bold text-[#2271b1] flex items-center gap-2 cursor-pointer">
                       <Zap className="w-4 h-4" /> General
                    </div>
                    <div className="p-3 hover:bg-white text-[13px] text-[#2271b1] flex items-center gap-2 cursor-pointer border-b border-[#c3c4c7]/30">
                       <Package className="w-4 h-4 text-[#8c8f94]" /> Inventory
                    </div>
                 </div>
                 <div className="flex-1 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Regular price ($)</label>
                          <input 
                             type="number"
                             className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                             value={formData.price}
                             onChange={(e) => setFormData({...formData, price: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Sale price ($)</label>
                          <input 
                             type="number"
                             className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                             value={formData.compareAtPrice}
                             onChange={(e) => setFormData({...formData, compareAtPrice: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">SKU</label>
                          <input 
                             className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                             value={formData.sku}
                             onChange={(e) => setFormData({...formData, sku: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold text-[#1d2327]">Stock level</label>
                          <input 
                             type="number"
                             className="w-full border border-[#8c8f94] focus:border-[#2271b1] outline-none p-1.5 text-[14px]"
                             value={formData.stock}
                             onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-5">
           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Publish
              </div>
              <div className="p-4 space-y-4">
                 <div className="text-[13px] space-y-2">
                    <p>Status: <span className="font-bold">{formData.status}</span> <span className="text-[#2271b1] cursor-pointer hover:underline">Edit</span></p>
                    <p>Visibility: <span className="font-bold">Public</span> <span className="text-[#2271b1] cursor-pointer hover:underline">Edit</span></p>
                    <p>Published on: <span className="font-bold">{new Date(formData.createdAt).toLocaleDateString()}</span></p>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f1]">
                    <button type="button" className="text-[#d63638] text-[13px] hover:underline">Move to Trash</button>
                    <button 
                       disabled={saving}
                       className="bg-[#2271b1] text-white px-4 py-2 rounded-sm text-[13px] font-bold hover:bg-[#135e96] transition-all"
                    >
                       {saving ? "Updating..." : "Update"}
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Product categories
              </div>
              <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                 {categories.map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 text-[13px] cursor-pointer">
                       <input 
                         type="radio" 
                         name="category"
                         checked={formData.category === cat.name}
                         className="border-[#8c8f94]" 
                         onChange={() => setFormData({...formData, category: cat.name})}
                       />
                       {cat.name}
                    </label>
                 ))}
              </div>
           </div>

           <div className="bg-white border border-[#c3c4c7]">
              <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-3 py-2 text-[13px] font-bold">
                 Product image
              </div>
              <div className="p-4">
                 {formData.images?.length > 0 ? (
                    <div className="relative group">
                       <img src={formData.images[0]} alt="" className="w-full aspect-square object-cover border border-[#c3c4c7]" />
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, images: []})}
                         className="absolute top-2 right-2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="w-4 h-4 text-[#d63638]" />
                       </button>
                    </div>
                 ) : (
                    <div className="aspect-square bg-[#f0f0f1] border-2 border-dashed border-[#c3c4c7] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-all">
                       <ImageIcon className="w-8 h-8 text-[#8c8f94] mb-2" />
                       <span className="text-[13px] text-[#2271b1] font-medium">Set product image</span>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
