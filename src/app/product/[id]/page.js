import Image from "next/image";
import { Star, Plus, Minus, ShoppingBag, ShieldCheck, RefreshCw, Truck, ChevronRight, FileText, HelpCircle, User, Check } from "lucide-react";
import ProductSection from "@/components/home/ProductSection";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import ClientProductActions from "@/components/product/ClientProductActions";
import ClientTabSystem from "@/components/product/ClientTabSystem";

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const { id: paramId } = resolvedParams;
  
  await dbConnect();
  let product;
  
  // Try finding by numeric ID first (Legacy)
  const numericId = parseInt(paramId);
  if (!isNaN(numericId)) {
    product = await Product.findOne({ id: numericId, isDeleted: { $ne: true } }).lean();
  }
  
  // Try finding by Slug if not found by ID (Modern)
  if (!product) {
    product = await Product.findOne({ slug: paramId, isDeleted: { $ne: true } }).lean();
  }
  
  const relatedProducts = await Product.find({ isDeleted: { $ne: true } }).limit(4).lean();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
         <h1 className="text-2xl font-black heading-font uppercase">Product Not Found</h1>
         <Link href="/" className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4">Return Home</Link>
      </div>
    );
  }

  const renderStars = (rating, size = "w-3 h-3") => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`${size} ${i < Math.floor(rating) ? 'fill-[#FFC633] text-[#FFC633]' : 'fill-black/5 text-black/5'}`} 
        />
      );
    }
    return stars;
  };

  // Convert MongoDB IDs to strings for client components
  const sanitizedProduct = JSON.parse(JSON.stringify(product));
  const sanitizedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-16 py-4 md:py-8">
        <nav className="flex items-center gap-2 mb-6 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-black/30 border-b border-black/5 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-black transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-2.5 h-2.5 opacity-40 shrink-0" />
          <Link href="/shop" className="hover:text-black transition-colors shrink-0">Shop</Link>
          <ChevronRight className="w-2.5 h-2.5 opacity-40 shrink-0" />
          <span className="text-black font-semibold tracking-normal truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex md:flex-col gap-2 md:w-20 order-2 md:order-1 overflow-x-auto md:overflow-y-auto scrollbar-hide shrink-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative aspect-square md:aspect-square w-20 md:w-full bg-[#F0F0F0] rounded-lg overflow-hidden cursor-pointer shrink-0">
                    <Image src={product.images?.[0] || product.image || "/placeholder.jpg"} alt="Thumb" fill className="object-cover opacity-60 hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
              <div className="relative flex-1 aspect-[3/4] bg-[#F0F0F0] rounded-xl overflow-hidden border border-black/5 order-1 md:order-2">
                 <Image src={product.images?.[0] || product.image || "/placeholder.jpg"} alt={product.name} fill className="object-cover" priority />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1">
                <p className="text-[8px] md:text-[9px] font-bold text-black/20 uppercase tracking-[0.2em]">Pairo Studio — {product.category}</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold heading-font uppercase tracking-tight leading-tight">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{renderStars(product.rating, "w-3.5 h-3.5")}</div>
                <span className="text-[9px] md:text-[10px] font-bold text-black/30 uppercase tracking-widest pl-3 border-l border-black/10">
                  {product.rating}/5 Ratings
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-bold heading-font tracking-tight text-black">${product.price}</span>
                {product.oldPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-black/10 line-through">${product.oldPrice}</span>
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                      -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-black/50 text-xs md:text-sm leading-relaxed font-medium">
              {product.description || product.details || "A premium handcrafted shearling masterpiece from the Pairo collection."}
            </p>

            {/* Use Client Component for interactive parts */}
            <ClientProductActions product={sanitizedProduct} />

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
              <div className="flex items-center gap-2 md:gap-3">
                <Truck className="w-4 h-4 text-black/20" />
                <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-black/40">Free Express Ship</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <ShieldCheck className="w-4 h-4 text-black/20" />
                <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-black/40">Lifetime Service</span>
              </div>
            </div>
          </div>
        </div>

        <ClientTabSystem product={sanitizedProduct} />
      </div>

      <div className="mt-8 border-t border-black/5 pt-8 md:pt-12">
        <ProductSection title="Related Products" products={sanitizedRelated} />
      </div>
    </div>
  );
}
