"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import siteData from "@/lib/data.json";

export default function CategoryBanner() {
  const { categories } = siteData;
  const displayCategories = categories.slice(0, 3);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Bento Spans [1 : 2 : 1]
  const layoutSpans = [
    "lg:col-span-1",
    "lg:col-span-2",
    "lg:col-span-1"
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header - Aligned to Site Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4">
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-black/20" />
                <span className="text-[9px] font-bold tracking-[0.3em] text-black/30 uppercase">
                  PAIRO ARCHIVES
                </span>
             </div>
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold heading-font tracking-tighter text-black uppercase leading-none">
               Shop By Category
             </h2>
          </div>
          
          <button className="group relative hidden sm:flex items-center gap-4 border border-black px-8 py-3.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 hover:text-white active:scale-95">
             <span className="relative z-10">Explore All Collection</span>
             <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
             <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
          </button>
        </div>

        {/* Bento Grid [Small : Large : Small] */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {displayCategories.map((category, index) => {
            const isSmall = index === 0 || index === 2;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative h-[300px] md:h-[380px] rounded-[24px] md:rounded-[32px] overflow-hidden bg-[#F9F9F9] border border-black/[0.03] ${layoutSpans[index]}`}
              >
                {/* Image Layers */}
                <motion.div 
                  animate={{ opacity: hoveredIndex === index ? 0 : 1 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <Image src={category.image} alt={category.name} fill className="object-cover" />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <Image src={category.image} alt={category.name} fill className="object-cover scale-110" />
                </motion.div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-50 group-hover:opacity-70 transition-opacity" />

                {/* Content Area */}
                <div className={`absolute inset-0 p-8 md:p-10 flex flex-col ${isSmall ? 'items-center text-center' : 'items-start text-left'}`}>
                  {/* Top Section */}
                  <div className="space-y-1.5">
                     <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">
                       DEPARTMENT 0{index + 1}
                     </span>
                     <h3 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white heading-font uppercase tracking-tighter leading-none`}>
                       {category.name}
                     </h3>
                  </div>

                  {/* Button - Centralized for Small Cards */}
                  <div className={`mt-auto w-full flex ${isSmall ? 'justify-center' : 'justify-start'}`}>
                     <button className="group/btn relative overflow-hidden bg-white text-black px-8 py-3 rounded-full font-bold text-[9px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl active:scale-95">
                        <span className="relative z-10 flex items-center gap-2 group-hover/btn:text-white transition-colors duration-300">
                          {index === 1 ? "Explore Full Collection" : "Explore"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <div className="absolute inset-0 bg-black translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                     </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
