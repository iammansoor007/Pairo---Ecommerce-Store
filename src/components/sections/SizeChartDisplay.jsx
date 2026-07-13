"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight, Ruler } from "lucide-react";

function LightboxModal({ items, activeIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const item = items[activeIndex];
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prev */}
        {items.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-5xl max-h-[85vh] w-full mx-16 flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-h-[75vh]">
            <img
              src={item.image}
              alt={item.title}
              className="max-w-full max-h-[75vh] object-contain mx-auto rounded-xl shadow-2xl"
            />
          </div>
          {(item.title || item.description) && (
            <div className="text-center">
              {item.title && <p className="text-white font-bold text-lg">{item.title}</p>}
              {item.description && <p className="text-white/50 text-sm mt-1">{item.description}</p>}
            </div>
          )}
          <div className="text-white/30 text-[12px]">{activeIndex + 1} / {items.length}</div>
        </motion.div>

        {/* Next */}
        {items.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function SizeChartDisplay({
  sectionTitle = "SIZE CHARTS",
  sectionLabel = "MEASUREMENTS",
  sectionDescription = "Use these detailed size charts to find your perfect fit. Click any chart to zoom in for a closer look.",
  headingLevel = "h2",
  customCharts = []
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const Heading = headingLevel;

  useEffect(() => {
    if (customCharts && customCharts.length > 0) {
      setItems(customCharts);
      setLoading(false);
    } else {
      setLoading(true);
      fetch("/api/size-chart/items")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [customCharts]);

  const handlePrev = () => setLightboxIndex(i => (i === 0 ? items.length - 1 : i - 1));
  const handleNext = () => setLightboxIndex(i => (i === items.length - 1 ? 0 : i + 1));

  return (
    <section className="container mx-auto px-4 md:px-8 py-20 md:py-28">
      {/* Header */}
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

      {/* Charts */}
      {loading ? (
        <div className="space-y-10">
          {[0, 1].map(i => (
            <div key={i} className="rounded-[24px] border border-border overflow-hidden animate-pulse">
              <div className="h-12 bg-muted" />
              <div className="aspect-[16/9] bg-muted/60" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <Ruler className="w-9 h-9 text-border" />
          </div>
          <p className="text-foreground/40 text-base">Size charts coming soon.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {items.map((item, index) => (
            <motion.div
              key={item._id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-[24px] border border-border overflow-hidden shadow-md bg-white"
            >
              {/* Chart header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/50">
                <div>
                  <h3 className="font-heading font-black text-foreground text-lg">{item.title}</h3>
                  {item.description && (
                    <p className="text-foreground/50 text-sm mt-0.5">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setLightboxIndex(index)}
                  className="flex items-center gap-2 text-primary text-[12px] font-bold uppercase tracking-wider hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" /> Zoom
                </button>
              </div>

              {/* Chart image */}
              <div
                className="relative cursor-zoom-in group overflow-hidden"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-102"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <LightboxModal
          items={items}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </section>
  );
}
