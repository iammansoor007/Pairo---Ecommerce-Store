"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import siteData from "@/lib/data.json";
import MarqueeSection from "./MarqueeSection";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { hero, brand } = siteData;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % hero.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? hero.slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden mx-4 md:mx-8 my-6 rounded-[32px] md:rounded-[40px] shadow-2xl bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image Container */}
          <div className="absolute inset-0">
            <Image
              src={hero.slides[currentSlide].image}
              alt={hero.slides[currentSlide].title}
              fill
              className="object-cover object-right md:object-center"
              priority
            />
          </div>

          {/* Luxury Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:from-black/80 md:via-black/30" />
          
          {/* Content Area */}
          <div className="container mx-auto px-6 md:px-16 h-full flex items-center relative z-10">
            <div className="max-w-2xl">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-[1.5px] w-8 bg-white/30" />
                  <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase heading-font">
                    {brand.tagline}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white heading-font leading-[1.1] tracking-tight max-w-[12ch] md:max-w-none">
                  {hero.slides[currentSlide].title}
                </h1>
                
                <p className="text-white/40 text-xs md:text-base lg:text-lg max-w-md leading-relaxed font-sans">
                  {hero.slides[currentSlide].subtitle}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 pt-4 md:pt-6">
                  <button className="group relative overflow-hidden bg-white text-black px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-xs md:text-sm transition-all duration-500 shadow-xl active:scale-95">
                    <span className="relative z-10 flex items-center gap-2 transition-colors duration-500 group-hover:text-white">
                      {hero.slides[currentSlide].buttonText}
                      <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
                  </button>
                  <button className="text-white/40 text-xs md:text-sm font-bold flex items-center gap-2 hover:text-white transition-all group">
                    <span className="border-b border-white/10 pb-0.5 group-hover:border-white transition-all uppercase tracking-widest">View Lookbook</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 right-10 md:bottom-16 md:right-16 flex items-center gap-4 md:gap-8 z-30">
         <div className="hidden md:flex items-center gap-3 text-white font-bold heading-font">
            <span className="text-xl">0{currentSlide + 1}</span>
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-white/30 text-sm">0{hero.slides.length}</span>
         </div>

         <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all bg-black/20 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-all"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
         </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-black/10 w-full z-40 overflow-hidden">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            key={currentSlide}
            transition={{ duration: 7, ease: "linear" }}
          />
      </div>

      <MarqueeSection />
    </section>
  );
}
