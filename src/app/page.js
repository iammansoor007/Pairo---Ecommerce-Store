"use client";

import Hero from "@/components/home/Hero";
import ProductSection from "@/components/home/ProductSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import Testimonials from "@/components/home/Testimonials";
import CategoryBanner from "@/components/home/CategoryBanner";
import FeatureMarquee from "@/components/home/FeatureMarquee";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import BlogSection from "@/components/home/BlogSection";
import Reveal from "@/components/common/Reveal";
import siteData from "@/lib/data.json";

export default function Home() {
  const { products } = siteData;

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <Reveal delay={0.2}>
        <ProductSection title="NEW ARRIVALS" products={products.newArrivals} />
      </Reveal>
      
      <Reveal>
        <FeatureMarquee />
      </Reveal>
      
      <Reveal>
        <ProductSection title="TOP SELLING" products={products.topSelling} />
      </Reveal>
      
      <Reveal>
        <FeaturedBanner />
      </Reveal>
      
      <Reveal>
        <CategoryBanner />
      </Reveal>
      
      <Reveal>
        <BlogSection />
      </Reveal>
      
      <Reveal>
        <Testimonials />
      </Reveal>
    </div>
  );
}
