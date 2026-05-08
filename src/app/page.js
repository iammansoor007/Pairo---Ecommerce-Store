import Hero from "@/components/home/Hero";
import ProductSection from "@/components/home/ProductSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import CategoryBanner from "@/components/home/CategoryBanner";
import FeatureMarquee from "@/components/home/FeatureMarquee";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import Testimonials from "@/components/home/Testimonials";
import siteData from "@/lib/data.json";

export default function Home() {
  const { products } = siteData;

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <ProductSection title="NEW ARRIVALS" products={products.newArrivals} />
      <FeatureMarquee />
      <ProductSection title="TOP SELLING" products={products.topSelling} />
      <FeaturedBanner />
      <CategoryBanner />

      <Testimonials />
    </div>
  );
}
