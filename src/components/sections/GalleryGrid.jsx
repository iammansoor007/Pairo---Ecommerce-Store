"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";

function GalleryCard({ item, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const productUrl = item.linkedProductSlug
    ? `/product/${item.linkedProductSlug}`
    : item.linkedProductId
    ? `/product/${item.linkedProductId}`
    : item.linkedProduct
    ? `/product/${item.linkedProduct}`
    : null;

  const CardWrapper = productUrl ? Link : "div";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group cursor-pointer w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] bg-[var(--secondary)] rounded-[16px] md:rounded-[24px] overflow-hidden border border-[var(--border)]">
        <CardWrapper href={productUrl || "#"} className="block h-full w-full">
          {/* Main Image */}
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title || "Gallery Item"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                quality={75}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border">
                <ShoppingBag className="w-12 h-12 text-border" />
              </div>
            )}
          </motion.div>

          {/* Hover Image Overlay with Action */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center z-10">
            {productUrl && (
              <button
                className="bg-black text-white h-9 md:h-10 px-5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out active:scale-95 hover:bg-neutral-800"
              >
                View Jacket
              </button>
            )}
          </div>
        </CardWrapper>
      </div>

      {/* Info Section under Image (Matching Pairo's native ProductCard layout) */}
      <div className="mt-3 md:mt-4 space-y-1 md:space-y-2 px-1">
        <h3 
          style={{ fontFamily: "var(--brand-font)" }}
          className="text-[11px] md:text-[13px] font-bold uppercase tracking-wider text-foreground/85 group-hover:text-primary transition-colors truncate"
        >
          {item.title}
        </h3>

        {item.description && (
          <p className="text-[12px] text-foreground/45 line-clamp-2 mt-1 leading-relaxed font-medium">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 md:pt-3 mt-2 md:mt-3">
          {productUrl ? (
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
              Explore Collection →
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/35">
              Bespoke Gallery
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryGrid({
  sectionTitle = "OUR WORK",
  sectionLabel = "FEATURED PIECES",
  sectionDescription = "A carefully curated selection of our finest pieces — each one a testament to premium leather craftsmanship.",
  emptyText = "Gallery coming soon. Check back for our latest work.",
  headingLevel = "h2",
  customItems = []
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const Heading = headingLevel;

  useEffect(() => {
    if (customItems && customItems.length > 0) {
      setItems(customItems);
      setLoading(false);
    } else {
      setLoading(true);
      fetch("/api/gallery/items")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [customItems]);

  return (
    <section className="container mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <span className="inline-block text-[11px] font-bold uppercase tracking-[4px] text-primary/60 mb-4">
          {sectionLabel}
        </span>
        <Heading className="font-heading text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          {sectionTitle}
        </Heading>
        <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {sectionDescription}
        </p>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-[20px] overflow-hidden border border-border animate-pulse">
              <div className="aspect-[3/4] bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-9 h-9 text-border" />
          </div>
          <p className="text-foreground/40 text-base">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <GalleryCard key={item._id || index} item={item} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
