"use client";

import { Truck, ShieldCheck, Headphones, CreditCard, Star, Zap, Globe, Heart } from "lucide-react";

const MarqueeRow = ({ items, speed = 80 }) => {
  return (
    <div className="marquee-container group py-6 md:py-8 overflow-hidden flex whitespace-nowrap cursor-pointer bg-white border-y border-black/5">

      {/* Seamless Loop Track */}
      <div className="marquee-content flex shrink-0 items-center animate-scroll-left">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 md:gap-14 px-10 md:px-20">
                <item.icon className="w-8 h-8 md:w-12 md:h-12 text-black stroke-[1.2px] opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-2xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[-0.02em] whitespace-nowrap heading-font text-black/80 group-hover:text-black transition-colors duration-500">
                  {item.text}
                </span>
                <div className="w-2.5 h-2.5 md:w-4 md:h-4 border border-black/10 rounded-full ml-10 md:ml-20 flex items-center justify-center">
                  <div className="w-1 h-1 bg-black/20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .marquee-container:hover .marquee-content {
          animation-play-state: paused !important;
        }
        .animate-scroll-left {
          animation: scroll-left ${speed}s linear infinite;
        }
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
};

export default function FeatureMarquee() {
  const allFeatures = [
    { icon: Zap, text: "20% Off First Order" },
    { icon: Truck, text: "Express Delivery" },
    { icon: Star, text: "Premium Shearling" },
    { icon: ShieldCheck, text: "30-Day Guarantee" },
    { icon: Globe, text: "Global Shipping" },
    { icon: Headphones, text: "24/7 Support" },
  ];

  return (
    <section className="bg-white overflow-hidden">
      <MarqueeRow items={allFeatures} speed={100} />
    </section>
  );
}
