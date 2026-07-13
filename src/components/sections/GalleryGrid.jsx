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
      className="group relative rounded-[24px] overflow-hidden shadow-lg aspect-[3/4] border border-white/10 bg-muted cursor-pointer"
    >
      {/* Image */}
      {item.image ? (
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border">
          <ShoppingBag className="w-12 h-12 text-border" />
        </div>
      )}

      {/* Ambient Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Immersive Editorial Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end h-[60%] text-white space-y-2">
        <span className="text-[9px] font-black uppercase tracking-[3px] text-white/50">
          PAIRO GALLERY
        </span>

        <h3 className="font-heading font-black text-white text-xl leading-tight tracking-tight">
          {item.title}
        </h3>

        {/* Collapsible Details on Hover */}
        <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden space-y-4">
          {item.description && (
            <p className="text-white/70 text-[12px] leading-relaxed line-clamp-3">
              {item.description}
            </p>
          )}

          {productUrl && (
            <Link
              href={productUrl}
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all duration-300 shadow-md"
            >
              View Product <ArrowRight className="w-3 h-3" />
            </Link>
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
