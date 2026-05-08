"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export default function ProductSection({ title, products }) {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    const current = carouselRef.current;
    if (current) {
      current.addEventListener("scroll", checkScroll);
      checkScroll();
    }
    return () => current?.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden border-b border-black/5 last:border-0">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header Section - Forces heading and arrows on same line for mobile */}
        <div className="flex items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
             <div className="inline-flex items-center bg-black text-white px-3 py-1 rounded-md">
                <span className="text-[7px] md:text-[9px] font-bold tracking-[0.2em] uppercase">
                  PAIRO SERIES
                </span>
             </div>
             <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold heading-font tracking-tighter text-black uppercase leading-none truncate">
               {title}
             </h2>
          </div>

          {/* Actions Container */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
             {/* Desktop Explore Button */}
             <button className="group relative hidden sm:flex items-center gap-4 border border-black px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 hover:text-white active:scale-95">
                <span className="relative z-10">Explore All Collection</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
             </button>

             {/* Carousel Navigation - Now aligned on mobile */}
             <div className="flex gap-1.5 md:gap-2 sm:border-l border-black/5 sm:pl-6">
                <button 
                  onClick={() => scroll("left")}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                    canScrollLeft ? "text-black hover:bg-black hover:text-white" : "text-black/30 cursor-default"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => scroll("right")}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                    canScrollRight ? "text-black hover:bg-black hover:text-white" : "text-black/30 cursor-default"
                  }`}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
             </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative -mx-4 md:-mx-8 px-4 md:px-8">
          <div 
            ref={carouselRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((product) => (
              <div key={product.id} className="w-[75vw] sm:w-[45vw] md:w-[35vw] lg:w-[22.5vw] shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
