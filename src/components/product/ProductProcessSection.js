"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProductProcessSection() {
  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProcess() {
      try {
        const res = await fetch("/api/products/process");
        if (res.ok) {
          const data = await res.json();
          if (data && data.steps && data.steps.length > 0) {
            setProcess(data);
          }
        }
      } catch (err) {
        console.error("Error loading process section:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProcess();
  }, []);

  if (loading || !process) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-black/5">
      <div className="space-y-16 md:space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[10px] md:text-[11px] font-black text-black/50 uppercase tracking-[0.3em]"
          >
            {process.subtitle || "The Craftsmanship Behind Pairo"}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[26px] md:text-[40px] font-medium heading-font uppercase tracking-wider text-black leading-tight"
          >
            {process.title}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-16 h-[1.5px] bg-black/20 mx-auto"
          />
        </div>

        {/* Alternating Steps Timeline */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* Vertical timeline line for desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 -translate-x-1/2 hidden lg:block" />

          <div className="space-y-16 md:space-y-24 lg:space-y-32">
            {process.steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={step.id || idx}
                  className={`flex flex-col lg:flex-row items-center gap-8 md:gap-16 relative ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  
                  {/* Timeline Node Icon/Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-black/10 bg-white items-center justify-center font-mono text-[10px] font-bold hidden lg:flex">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </div>

                  {/* Step Image */}
                  <div className="w-full lg:w-1/2">
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[3/2] overflow-hidden bg-black/5 rounded-2xl group shadow-md"
                    >
                      <img
                        src={step.image}
                        alt={step.heading}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
                    </motion.div>
                  </div>

                  {/* Step Content */}
                  <div className={`w-full lg:w-1/2 space-y-4 ${isEven ? "lg:pl-8" : "lg:pr-8"}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-black border border-black/20 px-2.5 py-0.5 rounded-full lg:hidden">
                          Step {idx + 1}
                        </span>
                        {step.subheading && (
                          <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">
                            {step.subheading}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-[20px] md:text-[28px] font-medium heading-font uppercase tracking-wider text-black leading-tight">
                        {step.heading}
                      </h3>
                      
                      <p className="text-black/70 text-sm md:text-base leading-loose font-normal tracking-wide text-justify">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
