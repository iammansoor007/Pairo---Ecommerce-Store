import Image from "next/image";
import { Star, Plus, Minus, ShoppingBag, ShieldCheck, RefreshCw, Truck, ChevronRight, FileText, HelpCircle, User, Check, Zap, Layers, ScrollText, Award } from "lucide-react";
import ProductSection from "@/components/home/ProductSection";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import ClientProductActions from "@/components/product/ClientProductActions";
import ClientTabSystem from "@/components/product/ClientTabSystem";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  await dbConnect();
  const product = await Product.findOne({ 
    $or: [
      { id: parseInt(resolvedParams.id) || -1 },
      { slug: resolvedParams.id }
    ]
  }).lean();

  if (!product || product.status !== 'Published') return { title: "Product Not Found" };

  return {
    title: product.seo?.title || `${product.name} | Pairo Store`,
    description: product.seo?.description || product.shortDescription,
    openGraph: {
      images: [product.seo?.ogImage || product.images?.[0] || product.image],
    },
    alternates: {
      canonical: product.seo?.canonicalUrl || `/product/${product.slug || product.id}`,
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const { id: paramId } = resolvedParams;
  
  await dbConnect();
  let product;
  
  const numericId = parseInt(paramId);
  if (!isNaN(numericId)) {
    product = await Product.findOne({ id: numericId, isDeleted: { $ne: true } }).lean();
  }
  
  if (!product) {
    product = await Product.findOne({ slug: paramId, isDeleted: { $ne: true } }).lean();
  }
  
  if (product && product.status !== 'Published') {
    product = null;
  }
  
  const relatedProducts = await Product.find({ 
    isDeleted: { $ne: true },
    status: 'Published' 
  }).limit(4).lean();

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
          className={`${size} ${i < Math.floor(rating || 5) ? 'fill-[#FFC633] text-[#FFC633]' : 'fill-black/5 text-black/5'}`} 
        />
      );
    }
    return stars;
  };

  // Standard Pricing Logic:
  // product.price = Sale/Current Price (What they pay)
  // product.compareAtPrice = Regular/Original Price (What it was)
  const currentPrice = parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.compareAtPrice) || 0;
  const hasSale = originalPrice > currentPrice;
  const discountPercent = hasSale ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

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
                {(product.images || []).length > 0 ? product.images.map((img, i) => (
                  <div key={i} className="relative aspect-square w-20 md:w-full bg-[#F0F0F0] rounded-lg overflow-hidden cursor-pointer shrink-0 border border-black/5">
                    <Image src={img || "/placeholder.jpg"} alt="Thumb" fill className="object-cover opacity-60 hover:opacity-100 transition-all" />
                  </div>
                )) : (
                   <div className="relative aspect-square w-20 md:w-full bg-[#F0F0F0] rounded-lg overflow-hidden cursor-pointer shrink-0 border border-black/5">
                    <Image src="/placeholder.jpg" alt="Thumb" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="relative flex-1 aspect-[3/4] bg-[#F0F0F0] rounded-xl overflow-hidden border border-black/5 order-1 md:order-2 shadow-sm">
                 <Image src={product.images?.[0] || product.image || "/placeholder.jpg"} alt={product.name} fill className="object-cover" priority />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1">
                <p className="text-[8px] md:text-[9px] font-bold text-black/20 uppercase tracking-[0.2em]">Pairo Studio — {product.category || "Collection"}</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold heading-font uppercase tracking-tight leading-tight text-black">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{renderStars(product.rating, "w-3.5 h-3.5")}</div>
                <span className="text-[9px] md:text-[10px] font-bold text-black/30 uppercase tracking-widest pl-3 border-l border-black/10">
                   {product.rating || 5}/5 Ratings
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-bold heading-font tracking-tight text-black">${currentPrice}</span>
                {hasSale && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-black/10 line-through">${originalPrice}</span>
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                      -{discountPercent}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Short Description below Price */}
            {product.shortDescription && (
              <p className="text-black/50 text-xs md:text-sm leading-relaxed font-medium italic border-l-2 border-black/5 pl-4 py-1">
                {product.shortDescription}
              </p>
            )}

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

        {/* Narrative Section */}
        {product.narrative?.content && (
          <div className="mt-16 md:mt-24 bg-[#F9F9F9] rounded-[40px] p-8 md:p-20 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl -mr-48 -mt-48 transition-all group-hover:bg-black/[0.08]" />
             <div className="max-w-3xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-black text-white rounded-2xl"><ScrollText className="w-5 h-5" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">{product.narrative.title || "The Story"}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold heading-font uppercase tracking-tight mb-8 leading-[1.1]">
                   {product.name} <br/> 
                   <span className="text-black/20">Masterpiece Narrative</span>
                </h2>
                <div className="text-lg md:text-xl text-black/60 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: product.narrative.content.replace(/\n/g, '<br/>') }} />
             </div>
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-black/5 pt-12 md:pt-20">
        <ProductSection title="Related Products" products={sanitizedRelated} />
      </div>
    </div>
  );
}
