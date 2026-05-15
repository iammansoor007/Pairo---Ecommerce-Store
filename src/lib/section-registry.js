import dynamic from "next/dynamic";

export const SECTION_REGISTRY = {
  hero_slider: dynamic(() => import("@/components/home/Hero")),
  product_grid: dynamic(() => import("@/components/home/ProductSection")),
  feature_marquee: dynamic(() => import("@/components/home/FeatureMarquee")),
  banner_feature: dynamic(() => import("@/components/home/FeaturedBanner")),
  category_showcase: dynamic(() => import("@/components/home/CategoryBanner")),
  blog_grid: dynamic(() => import("@/components/home/BlogSection")),
  testimonials: dynamic(() => import("@/components/home/Testimonials")),
};

export const getSectionComponent = (type) => {
  return SECTION_REGISTRY[type] || null;
};
