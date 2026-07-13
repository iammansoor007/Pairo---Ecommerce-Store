"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";

function GalleryCard({ item, index }) {
  const productUrl = item.linkedProductSlug
    ? `/product/${item.linkedProductSlug}`
    : item.linkedProductId
    ? `/product/${item.linkedProductId}`
    : item.linkedProduct
    ? `/product/${item.linkedProduct}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group relative bg-white rounded-[20px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-border"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border">
            <ShoppingBag className="w-12 h-12 text-border" />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
          {productUrl && (
            <Link
              href={productUrl}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 inline-flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-full font-bold text-[12px] uppercase tracking-wider shadow-lg hover:bg-primary hover:text-white"
            >
              View Product <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <h3 className="font-heading font-black text-foreground text-[17px] mb-1.5 line-clamp-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-foreground/55 text-[13px] leading-relaxed line-clamp-2 mb-4">
            {item.description}
          </p>
        )}
        {productUrl ? (
          <Link
            href={productUrl}
            className="inline-flex items-center gap-2 text-primary font-bold text-[12px] uppercase tracking-wider hover:gap-3 transition-all duration-200"
          >
            View Product <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-foreground/30 text-[12px] uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" /> No product linked
          </span>
        )}
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
    <section className="container mx-auto px-4 md:px-8 py-20 md:py-28">
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
