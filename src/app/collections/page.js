import Link from "next/link";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ChevronRight, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Collections | Pairo",
  description: "Browse all Pairo collections — premium shearling and leather jackets crafted for modern wear.",
};

export default async function CollectionsPage() {
  await dbConnect();

  const categories = await Category.find({
    status: "Published",
    isDeleted: { $in: [false, null] },
    type: "product",
  })
    .sort({ name: 1 })
    .lean();

  // Get product counts per category
  const counts = await Product.aggregate([
    { $match: { isDeleted: { $ne: true }, status: "Published" } },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  counts.forEach((c) => {
    if (c._id) countMap[c._id.toString()] = c.count;
  });

  const cats = categories.map((cat) => ({
    ...cat,
    _id: cat._id.toString(),
    productCount: countMap[cat._id.toString()] || 0,
  }));

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* Premium Header/Hero Section */}
      <div className="border-b border-black/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-20">
          {/* Breadcrumb (P tags instead of H) */}
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-6">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-black/35" />
            <span className="text-black">Collections</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/40">Luxury Store</p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-none text-black">
                Our Collections
              </p>
            </div>
            <p className="text-xs sm:text-sm text-black/50 max-w-md leading-relaxed">
              Explore our meticulously curated collections, featuring premium leather, shearling, and custom-tailored outerwear built to stand the test of time.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="container mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-20">
        {cats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg font-bold uppercase tracking-widest text-black mb-2">No Collections Found</p>
            <p className="text-xs text-black/40">We are adding new premium collections shortly. Stay tuned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-12">
            {cats.map((cat) => (
              <Link
                key={cat._id}
                href={`/collections/${cat.slug}`}
                className="group flex flex-col bg-white overflow-hidden rounded-[24px] border border-black/[0.06] hover:border-black/15 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-50 border-b border-black/[0.03]">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                      <p className="text-6xl font-black uppercase text-black/5 tracking-tighter">
                        {cat.name.charAt(0)}
                      </p>
                    </div>
                  )}

                  {/* Elegant Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Hover Button */}
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <span className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">
                      Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm md:text-base font-extrabold uppercase tracking-[0.15em] text-black group-hover:text-black/75 transition-colors leading-snug">
                      {cat.name}
                    </p>
                    <span className="bg-black/5 text-[9px] font-bold px-2.5 py-1 rounded-full text-black/60 tabular-nums">
                      {cat.productCount} {cat.productCount === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-black/45 mt-3 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
