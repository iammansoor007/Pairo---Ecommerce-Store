"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import siteData from "@/lib/data.json";

const TestimonialCard = ({ review, isActive, position, onSwipe }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-200, 200], [10, -10]);
  const rotateY = useTransform(mouseX, [-200, 200], [-10, 10]);

  const handleMouseMove = (e) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Logic for side cards
  const isLeft = position < 0;
  const isRight = position > 0;

  return (
    <motion.div
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 80 || Math.abs(velocity.x) > 400) {
          onSwipe(offset.x > 0 ? "prev" : "next");
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{
        scale: isActive ? 1 : 0.75,
        x: position * 220, // Clearly visible on sides
        zIndex: isActive ? 30 : 20 - Math.abs(position),
        opacity: isActive ? 1 : 0.15,
        rotateY: position * -35,
        y: isActive ? 0 : 20,
        filter: isActive ? "blur(0px)" : "blur(10px)",
      }}
      style={{
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : (position * -35),
        transformStyle: "preserve-3d",
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 26
      }}
      className={`absolute w-[260px] md:w-[460px] bg-white rounded-[24px] md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-black/[0.04] border border-black/[0.05] flex flex-col gap-6 group cursor-grab active:cursor-grabbing select-none`}
    >
      {/* Profile Header */}
      <div style={{ transform: "translateZ(50px)" }} className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-base md:text-xl shadow-xl overflow-hidden relative">
            {review.name[0]}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-black font-bold text-sm md:text-xl heading-font tracking-tighter leading-none uppercase">
              {review.name}
            </h4>
            <span className="text-black/30 text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">
              Verified Member
            </span>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 md:w-4 md:h-4 ${i < review.rating ? 'fill-[#FFC633] text-[#FFC633]' : 'text-black/5'}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-black/[0.05]" />

      {/* Review Text - Compact & Decent */}
      <div style={{ transform: "translateZ(30px)" }} className="relative">
        <p className="text-black text-xs md:text-lg font-medium leading-[1.5] heading-font tracking-tight italic">
          "{review.text}"
        </p>
      </div>

      {/* Verified Status */}
      <div style={{ transform: "translateZ(40px)" }} className="flex items-center gap-3 pt-2">
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </div>
        <span className="text-black/30 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em]">
          Verified Archive Perspective — 0.1
        </span>
      </div>
    </motion.div>
  );
};

export default function Testimonials() {
  const { testimonials } = siteData;
  const reviews = testimonials.reviews;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === "next") {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  const getPosition = (index) => {
    let diff = index - currentIndex;
    // Handle infinite wrap
    if (diff > reviews.length / 2) diff -= reviews.length;
    if (diff < -reviews.length / 2) diff += reviews.length;
    return diff;
  };

  return (
    <section className="py-6 md:py-12 bg-white overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-8 relative z-10">

        {/* Compact Site Heading */}
        <div className="flex items-end justify-between mb-4 md:mb-6 gap-6">
          <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center bg-black text-white px-3 py-1 rounded-md">
              <span className="text-[7px] md:text-[9px] font-bold tracking-[0.2em] uppercase">
                PAIRO ARCHIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold heading-font tracking-tighter text-black uppercase leading-none truncate">
              {testimonials.title || "The Voices"}
            </h2>
          </div>

          {/* Minimalist Swiper Controls */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleSwipe("prev")}
              className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 active:scale-90 group"
            >
              <ChevronLeft className="w-5 h-5 md:w-8 md:h-8 transition-transform duration-500 group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => handleSwipe("next")}
              className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 active:scale-90 group"
            >
              <ChevronRight className="w-5 h-5 md:w-8 md:h-8 transition-transform duration-500 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Compact 3D Swiper - Showing Left, Center, and Right */}
        <div className="relative h-[350px] md:h-[500px] flex items-center justify-center perspective-[2000px]">
          {reviews.map((review, index) => {
            const position = getPosition(index);
            const isVisible = Math.abs(position) <= 1;

            if (!isVisible) return null;

            return (
              <TestimonialCard
                key={index}
                review={review}
                isActive={position === 0}
                position={position}
                onSwipe={handleSwipe}
              />
            );
          })}
        </div>

        {/* Optimized Footer */}
        <div className="flex flex-col items-center">
          <button className="group relative overflow-hidden bg-black text-white px-8 md:px-12 py-3.5 md:py-4.5 rounded-full font-bold text-[9px] md:text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95">
            <span className="relative z-10 flex items-center gap-3 group-hover:text-black transition-colors duration-500">
              Join The Archive
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
          </button>

          <div className="mt-10 md:mt-14 flex gap-3">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1 transition-all duration-700 rounded-full ${i === currentIndex ? 'w-14 bg-black' : 'w-3 bg-black/5'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
