"use client";

import { useState, use } from "react";
import Image from "next/image";
import { Star, StarHalf, Plus, Minus, Check } from "lucide-react";
import { motion } from "framer-motion";
import siteData from "@/lib/data.json";
import ProductSection from "@/components/home/ProductSection";

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { products, productDetails } = siteData;
  const allProducts = [...products.newArrivals, ...products.topSelling];
  const product = allProducts.find((p) => p.id === productId) || allProducts[0];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-5 h-5 fill-[var(--rating)] text-[var(--rating)]" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 fill-[var(--rating)] text-[var(--rating)]" />);
    }
    return stars;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 mb-10">
        <span>Home</span>
        <span>/</span>
        <span>Shop</span>
        <span>/</span>
        <span className="text-[var(--foreground)] font-medium uppercase">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative w-24 h-24 md:w-32 md:h-32 bg-[var(--secondary)] rounded-[20px] overflow-hidden cursor-pointer border-2 border-transparent hover:border-[var(--foreground)]">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
          <div className="relative flex-1 aspect-square bg-[var(--secondary)] rounded-[20px] overflow-hidden">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-sm text-[var(--foreground)]/60">
              {product.rating}/<span className="text-[var(--accent)]">5</span>
            </span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">${product.price}</span>
            {product.oldPrice && (
              <>
                <span className="text-3xl font-bold text-[var(--foreground)]/30 line-through">
                  ${product.oldPrice}
                </span>
                <span className="bg-[var(--discount-bg)] text-[var(--discount-text)] font-medium px-4 py-1.5 rounded-full text-sm">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="text-[var(--foreground)]/60 leading-relaxed mb-8 border-b border-[var(--foreground)]/10 pb-8">
            {productDetails.commonDescription}
          </p>

          {/* Color Selection */}
          <div className="mb-8 border-b border-[var(--foreground)]/10 pb-8">
            <p className="text-[var(--foreground)]/60 mb-4 font-medium">Select Colors</p>
            <div className="flex gap-4">
              {productDetails.colors.map((color, index) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === index && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8 border-b border-[var(--foreground)]/10 pb-8">
            <p className="text-[var(--foreground)]/60 mb-4 font-medium">Choose Size</p>
            <div className="flex flex-wrap gap-3">
              {productDetails.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${selectedSize === size
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)]/60 hover:bg-[var(--secondary)]/80"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex gap-5">
            <div className="flex items-center bg-[var(--secondary)] rounded-full px-6 py-4 gap-8">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:opacity-70">
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold w-4 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="hover:opacity-70">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <button className="flex-1 bg-[var(--primary)] text-[var(--background)] rounded-full font-bold hover:opacity-90 transition-all">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Tabs / Reviews Placeholder */}
      <div className="mt-20">
        <div className="flex border-b border-[var(--foreground)]/10 mb-10">
          <button className="px-8 py-4 border-b-2 border-[var(--foreground)] font-bold">Product Details</button>
          <button className="px-8 py-4 text-[var(--foreground)]/60">Rating & Reviews</button>
          <button className="px-8 py-4 text-[var(--foreground)]/60">FAQs</button>
        </div>
        <div className="text-[var(--foreground)]/60 leading-relaxed max-w-4xl">
          {productDetails.commonDescription}
          <br /><br />
          Crafted for versatility and durability, our garments are made from premium materials that stand the test of time.
          The meticulous attention to detail in every stitch ensures a perfect fit and a refined look that elevates your everyday style.
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-20">
        <ProductSection title="YOU MIGHT ALSO LIKE" products={products.newArrivals} />
      </div>
    </div>
  );
}
