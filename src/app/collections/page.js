import Link from "next/link";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ChevronRight } from "lucide-react";

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

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* Header/Hero Section */}
      <div className="border-b border-black/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-16">
          {/* Breadcrumb (using p instead of h) */}
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-6">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-black/35" />
            <span className="text-black">Collections</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/40">Luxury Store</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-none text-black">
                OUR COLLECTIONS
              </p>
            </div>
            <p className="text-xs sm:text-sm text-black/50 max-w-md leading-relaxed">
              Explore our full range of premium outerwear. Each collection is meticulously designed with hand-selected materials, rich details, and signature silhouettes.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-20">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base font-bold uppercase tracking-wider text-black/60 mb-2">No Collections Found</p>
            <p className="text-xs text-black/40">Check back soon for new premium outerwear drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {categories.map((cat) => (
              <Link
                key={cat._id.toString()}
                href={`/collections/${cat.slug}`}
                className="group flex flex-col items-center text-center w-full"
              >
                {/* Image Container - Square with Sharp Corners */}
                <div className="w-full aspect-square relative overflow-hidden bg-neutral-100">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                      <p className="text-5xl font-black uppercase text-black/10 tracking-tighter">
                        {cat.name.charAt(0)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Title Below Image - Uppercase, Centered, Bold */}
                <p className="text-base md:text-lg lg:text-xl font-bold uppercase tracking-[0.08em] text-[#2d2d2d] mt-5 group-hover:text-black transition-colors leading-tight">
                  {cat.name}
                </p>

                {/* Button - Centered, Dark Grey/Black, Sharp Corners */}
                <div className="mt-3.5">
                  <span className="inline-block bg-[#2d2d2d] text-white px-8 py-2.5 text-[11px] font-bold uppercase tracking-widest group-hover:bg-black transition-colors">
                    View Category
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
