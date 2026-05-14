import Hero from "@/components/home/Hero";
import ProductSection from "@/components/home/ProductSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import Testimonials from "@/components/home/Testimonials";
import CategoryBanner from "@/components/home/CategoryBanner";
import FeatureMarquee from "@/components/home/FeatureMarquee";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import BlogSection from "@/components/home/BlogSection";
import Reveal from "@/components/common/Reveal";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function Home() {
  let newArrivals = [];
  let topSelling = [];

  try {
    await dbConnect();
    const query = { tenantId: 'DEFAULT_STORE', status: 'Published' };
    
    // Fetch specifically tagged products
    newArrivals = await Product.find({ ...query, type: 'newArrival' }).limit(8).lean();
    topSelling = await Product.find({ ...query, type: 'topSelling' }).limit(8).lean();

    // FALLBACK: If sections are empty, just show the latest products
    if (newArrivals.length === 0) {
      newArrivals = await Product.find(query).sort({ createdAt: -1 }).limit(8).lean();
    }
    if (topSelling.length === 0) {
      topSelling = await Product.find(query).sort({ updatedAt: -1 }).limit(8).lean();
    }
  } catch (error) {
    console.error("Home Page Data Fetch Error:", error);
  }

  // Sanitize for client components
  const sanitizedNew = JSON.parse(JSON.stringify(newArrivals || []));
  const sanitizedTop = JSON.parse(JSON.stringify(topSelling || []));

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <Reveal delay={0.2}>
        <ProductSection title="NEW ARRIVALS" products={sanitizedNew} />
      </Reveal>
      
      <Reveal>
        <FeatureMarquee />
      </Reveal>
      
      <Reveal>
        <ProductSection title="TOP SELLING" products={sanitizedTop} />
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
