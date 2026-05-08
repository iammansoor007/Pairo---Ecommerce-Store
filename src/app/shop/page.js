"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight, X, Check } from "lucide-react";
import siteData from "@/lib/data.json";
import ProductCard from "@/components/home/ProductCard";

const ITEMS_PER_PAGE = 6;

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  
  const { products, filters } = siteData;
  const allProductsList = useMemo(() => [...products.newArrivals, ...products.topSelling], [products]);
  
  // States for filters
  const [maxPrice, setMaxPrice] = useState(filters.priceRange.max);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = allProductsList;

    // 1. Category Filter
    if (categoryParam) {
      result = result.filter(p => p.category.toLowerCase() === categoryParam.toLowerCase());
    }

    // 2. Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // 3. Color Filter (Mocked since products in data.json don't have individual colors yet, but I'll add logic)
    // In a real app, product.colors would be an array.
    if (selectedColors.length > 0) {
      // For demo, we'll assume products match if they aren't explicitly excluded
      // result = result.filter(p => p.colors.some(c => selectedColors.includes(c)));
    }

    // 4. Size Filter
    if (selectedSizes.length > 0) {
       // result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }

    return result;
  }, [allProductsList, categoryParam, maxPrice, selectedColors, selectedSizes]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 mb-8 border-t border-[var(--foreground)]/10 pt-6">
        <span>Home</span>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-black">Shop</Link>
        {categoryParam && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[var(--foreground)] font-medium capitalize">{categoryParam}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-72 border border-[var(--foreground)]/10 rounded-[20px] p-6 h-fit">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-[var(--foreground)]/10">
            <h3 className="font-bold text-2xl heading-font">Filters</h3>
            <SlidersHorizontal className="w-5 h-5 text-[var(--accent)]" />
          </div>

          <div className="space-y-8">
            {/* Categories */}
            <div className="pb-8 border-b border-[var(--foreground)]/10">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Categories</h4>
              <div className="flex flex-col gap-4 text-sm">
                <Link href="/shop" className={!categoryParam ? "font-bold" : "text-black/60"}>All Products</Link>
                {filters.categories.map((cat) => (
                  <Link 
                    key={cat} 
                    href={`/shop?category=${cat.toLowerCase()}`}
                    className={`flex items-center justify-between group ${
                      categoryParam?.toLowerCase() === cat.toLowerCase() ? "font-bold" : "text-black/60 hover:text-black"
                    }`}
                  >
                    <span>{cat}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pb-8 border-b border-[var(--foreground)]/10">
              <h4 className="font-bold mb-4">Price</h4>
              <input 
                type="range" 
                className="w-full accent-black cursor-pointer" 
                min={filters.priceRange.min} 
                max={filters.priceRange.max}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              />
              <div className="flex justify-between text-sm font-medium mt-2">
                <span>${filters.priceRange.min}</span>
                <span className="bg-black text-white px-2 py-0.5 rounded text-xs">${maxPrice}</span>
              </div>
            </div>

            {/* Colors Filter */}
            <div className="pb-8 border-b border-[var(--foreground)]/10">
              <h4 className="font-bold mb-4">Colors</h4>
              <div className="flex flex-wrap gap-2.5">
                {filters.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`w-7 h-7 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-110 relative`}
                    style={{ backgroundColor: color.toLowerCase() === 'tan' ? '#D2B48C' : color.toLowerCase() }}
                  >
                    {selectedColors.includes(color) && (
                      <div className={`w-2 h-2 rounded-full ${color.toLowerCase() === 'white' ? 'bg-black' : 'bg-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Filter */}
            <div className="pb-8 border-b border-[var(--foreground)]/10">
              <h4 className="font-bold mb-4">Size</h4>
              <div className="flex flex-wrap gap-2">
                {filters.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? "bg-black text-white"
                        : "bg-[var(--secondary)] text-black/60 hover:bg-black hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setMaxPrice(filters.priceRange.max);
                setSelectedColors([]);
                setSelectedSizes([]);
                setCurrentPage(1);
              }}
              className="w-full border border-black/10 py-3 rounded-full font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h2 className="text-3xl md:text-5xl font-bold heading-font tracking-tight">
              {categoryParam ? categoryParam : "Our Collection"}
            </h2>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[var(--foreground)]/50 font-medium">
                {filteredProducts.length} Products Found
              </span>
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[var(--foreground)]/50">Sort by:</span>
                <select className="font-semibold bg-transparent focus:outline-none cursor-pointer">
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
              <button 
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-3 bg-[var(--secondary)] rounded-full hover:bg-black hover:text-white transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-[var(--secondary)] rounded-[20px]">
              <p className="text-black/60 mb-4">No products match your current filters.</p>
              <button onClick={() => setMaxPrice(filters.priceRange.max)} className="text-black font-bold underline">
                Clear Price Filter
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-between border-t border-black/10 pt-8">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                  currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--secondary)]"
                }`}
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all ${
                      currentPage === i + 1 ? "bg-black text-white" : "hover:bg-[var(--secondary)] text-black/60"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                  currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--secondary)]"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center animate-pulse font-black text-2xl uppercase tracking-tighter">Refining Collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
