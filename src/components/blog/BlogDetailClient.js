"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Share2, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { getProductUrl } from "@/lib/routes";

const SectionHeader = ({ number, title }) => (
  <div className="flex items-end gap-3 mb-6 border-b border-black/10 pb-2">
     <span className="text-[10px] font-mono font-bold text-neutral-400">
        {number} //
     </span>
     <h2 className="text-xs sm:text-sm font-black heading-font uppercase tracking-wider text-black leading-none">
        {title}
     </h2>
  </div>
);

const BlogCard = ({ post }) => (
  <Link href={`/blog/${post.slug}`} className="group cursor-pointer w-full block">
    {/* Portrait Image Container - Premium Sharp Corners */}
    <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden border border-black/5 rounded-[4px]">
      <img 
        src={post.image} 
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
        loading="lazy"
      />
    </div>

    {/* Metadata Block */}
    <div className="mt-3.5 space-y-1 px-0.5">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black tracking-[0.2em] text-neutral-400 uppercase">
          {post.category || "JOURNAL"}
        </span>
        <span className="w-1 h-1 rounded-full bg-black/10" />
        <span className="text-[9px] font-bold text-neutral-400 tracking-wider">
          {post.date}
        </span>
      </div>
      
      <h3 
        style={{ fontFamily: "var(--brand-font)" }}
        className="text-[13px] font-black uppercase tracking-wide text-black transition-colors group-hover:underline decoration-1 underline-offset-4 leading-snug"
      >
        {post.title}
      </h3>
    </div>
  </Link>
);

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function BlogDetailClient({ post, posts, featuredProduct, postDate }) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      ...featuredProduct,
      quantity: 1,
      selectedSize: featuredProduct.sizes?.[0] || "Standard",
      selectedColor: featuredProduct.colors?.[0]?.name || "Original"
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart({
      ...featuredProduct,
      quantity: 1,
      selectedSize: featuredProduct.sizes?.[0] || "Standard",
      selectedColor: featuredProduct.colors?.[0]?.name || "Original"
    });
    router.push("/checkout");
  };

  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    const current = carouselRef.current;
    if (current) {
      current.addEventListener("scroll", checkScroll);
      checkScroll();
    }
    return () => current?.removeEventListener("scroll", checkScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Dynamically extract H2 headings from all post content for the sidebar TOC
  const [tocSections, setTocSections] = useState([]);

  useEffect(() => {
    const allContent = [post.content, post.heritage, post.process, post.style]
      .filter(Boolean)
      .join(" ");

    if (!allContent) {
      setTocSections([]);
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(allContent, "text/html");
      const h2s = Array.from(doc.querySelectorAll("h2"));
      const extracted = h2s.map((el, i) => {
        const text = el.textContent.trim();
        const id = `toc-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${i}`;
        return { id, title: text };
      });
      setTocSections(extracted);
    } catch (e) {
      setTocSections([]);
    }
  }, [post]);

  // Add IDs to H2 elements in the rendered blog content after mount
  useEffect(() => {
    if (tocSections.length === 0) return;
    const contentEl = document.getElementById("blog-main-content");
    if (!contentEl) return;
    const h2s = contentEl.querySelectorAll("h2");
    h2s.forEach((el, i) => {
      if (tocSections[i]) el.id = tocSections[i].id;
    });
  }, [tocSections]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="bg-white min-h-screen selection:bg-black selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `
        .blog-content {
          font-family: var(--body-font), sans-serif !important;
          font-size: 14px !important;
          line-height: 1.8 !important;
          color: #262626 !important;
        }
        .blog-content p {
          margin-bottom: 1.25rem !important;
        }
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 {
          font-family: var(--brand-font), sans-serif !important;
          text-transform: uppercase !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
          color: black !important;
          font-weight: 800 !important;
          letter-spacing: -0.01em !important;
        }
        .blog-content h1 { font-size: 22px !important; }
        .blog-content h2 { font-size: 18px !important; }
        .blog-content h3 { font-size: 16px !important; }
        .blog-content h4 { font-size: 14px !important; }
        .blog-content a {
          color: #1a1a1a !important;
          text-decoration: underline !important;
          font-weight: 600 !important;
          transition: all 0.2s ease-in-out !important;
        }
        .blog-content a:hover {
          opacity: 0.7 !important;
        }
      `}} />
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-black origin-left z-[100]" style={{ scaleX }} />

      <div className="container mx-auto px-2 sm:px-4 md:px-8 pt-5 pb-2 border-b border-black/5">
         <div className="flex justify-between items-center">
            <Link href="/blog" className="flex items-center gap-2 text-black font-bold text-[9px] uppercase tracking-[0.2em] hover:opacity-50 transition-all">
               <ArrowLeft className="w-3.5 h-3.5" />
               Archive Index
            </Link>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-2 text-black/40 hover:text-black transition-colors font-bold text-[9px] uppercase tracking-[0.2em]">
                  <Share2 className="w-3.5 h-3.5" />
                  Share Story
               </button>
            </div>
         </div>
      </div>

      <header className="pt-10 pb-8 md:pt-14 md:pb-10 border-b border-black/5">
         <div className="container mx-auto px-2 sm:px-4 md:px-8">
            <div className="flex items-center gap-2 mb-3">
               <span className="text-[9px] font-bold tracking-[0.3em] text-black/30 uppercase">{post.category}</span>
               <div className="w-5 h-px bg-black/10" />
               <span className="text-[9px] font-bold tracking-[0.3em] text-black/30 uppercase">{postDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold heading-font tracking-tight text-black uppercase leading-tight mb-4 max-w-4xl">
               {post.title}
            </h1>
            <p className="text-black/30 text-[8px] font-bold uppercase tracking-[0.2em]">
               PAIRO ARCHIVE SERIES — EDITION 0.1
            </p>
         </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 md:px-8 py-8 md:py-12">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
            <div id="blog-main-content" className="lg:col-span-8">
               <div className="aspect-[16/9] rounded-[4px] overflow-hidden border border-black/5 shadow-sm mb-10">
                  <img src={post.image} alt={post.imageAlts?.[post.image] || post.title || "Blog Image"} className="w-full h-full object-cover" />
               </div>

               <div className="w-full space-y-12 md:space-y-16">
                  {/* General Content */}
                  {post.content && (
                    <section id="general" className="scroll-mt-32">
                       <div 
                          className="text-sm md:text-base text-black leading-relaxed space-y-4 font-medium blog-content"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                       />
                    </section>
                  )}

                  {/* Heritage Section */}
                  {post.heritage && (
                    <section id="heritage" className="scroll-mt-32">
                       <SectionHeader number="01" title="Heritage" />
                       <div className="space-y-6">
                          {post.excerpt && (
                             <p className="text-lg md:text-xl font-medium leading-tight text-black tracking-tight border-l-2 border-black pl-5 italic">
                                 &quot;{post.excerpt}&quot;
                             </p>
                          )}
                          <div 
                             className="text-sm md:text-base text-black leading-relaxed space-y-4 font-medium blog-content"
                             dangerouslySetInnerHTML={{ __html: post.heritage }}
                          />
                       </div>
                    </section>
                  )}

                  {/* Process Section */}
                  {post.process && (
                    <section id="process" className="scroll-mt-32">
                       <SectionHeader number="02" title="Process" />
                       <div 
                          className="text-sm md:text-base text-black leading-relaxed space-y-4 font-medium blog-content"
                          dangerouslySetInnerHTML={{ __html: post.process }}
                       />
                    </section>
                  )}

                  {/* Style Section */}
                  {post.style && (
                    <section id="style" className="scroll-mt-32">
                       <SectionHeader number="03" title="Style" />
                       <div 
                          className="text-sm md:text-base text-black leading-relaxed space-y-4 font-medium blog-content"
                          dangerouslySetInnerHTML={{ __html: post.style }}
                       />
                    </section>
                  )}
               </div>
            </div>

            <div className="lg:col-span-4 relative">
               <aside className="sticky top-24 space-y-8 pl-6 border-l border-black/5">
                  {post.showSidebarIndex !== false && (
                    <div className="space-y-5">
                       <span className="text-[8px] font-bold tracking-[0.2em] text-black/30 uppercase">INDEX</span>
                       <div className="flex flex-col gap-3">
                          {tocSections.length > 0 ? (
                             tocSections.map((section) => (
                                <button 
                                  key={section.id}
                                  onClick={() => scrollToSection(section.id)}
                                  className="group flex items-center justify-between text-left"
                                >
                                   <span className="text-sm md:text-base font-bold heading-font text-black/30 group-hover:text-black transition-all uppercase tracking-tighter line-clamp-1">
                                      {section.title}
                                   </span>
                                   <ArrowRight className="w-3 h-3 text-black/5 group-hover:text-black transition-all shrink-0" />
                                </button>
                             ))
                          ) : (
                             <p className="text-[10px] text-black/20 italic">No sections found</p>
                          )}
                       </div>
                    </div>
                  )}
                   {post.showFeaturedProduct !== false && featuredProduct && featuredProduct.id !== "default" && (
                    <div id="archive" className="space-y-4 pt-6 border-t border-black/5">
                       <span className="text-[8px] font-bold tracking-[0.2em] text-black/30 uppercase">SHOP PIECE</span>
                       <Link href={getProductUrl(featuredProduct)} className="block aspect-square rounded-[4px] overflow-hidden border border-black/5 group cursor-pointer relative">
                          <img src={featuredProduct.images?.[0] || featuredProduct.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                       </Link>
                       <div className="space-y-1">
                          <h4 className="text-xs font-bold heading-font text-black uppercase">{featuredProduct.name}</h4>
                          {featuredProduct.price && (
                             <p className="text-[10px] font-bold text-black/40">${featuredProduct.price}</p>
                          )}
                       </div>
                       
                       <div className="space-y-2.5">
                          <Link 
                             href={getProductUrl(featuredProduct)}
                             className="flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 rounded-[4px] font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all shadow-lg active:scale-[0.98]"
                          >
                             Go to product
                             <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                             <button 
                                onClick={handleAddToCart}
                                className="flex items-center justify-center gap-2 w-full border border-black text-black py-3.5 rounded-[4px] font-bold text-[9px] uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-all active:scale-[0.98]"
                             >
                                Add to cart
                             </button>
                             <button 
                                onClick={handleBuyNow}
                                className="flex items-center justify-center gap-2 w-full bg-[#111] text-white py-3.5 rounded-[4px] font-bold text-[9px] uppercase tracking-[0.1em] hover:bg-black transition-all shadow-md active:scale-[0.98]"
                             >
                                Buy now
                             </button>
                          </div>
                       </div>
                    </div>
                  )}

                  {post.showSidebarIndex === false && post.showFeaturedProduct === false && (
                    <div className="space-y-5">
                       <span className="text-[8px] font-bold tracking-[0.2em] text-black/30 uppercase">BLOG OVERVIEW</span>
                       <div className="p-5 bg-gray-50 rounded-[4px] border border-black/[0.03] space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-black">About this Article</h4>
                          <p className="text-xs md:text-sm text-black/60 leading-relaxed font-medium">
                             {post.excerpt || "This article showcases Pairo's premium leather artisanal design, deep-rooted heritage, and unique craftsmanship."}
                          </p>
                          <div className="pt-2.5 border-t border-black/5 text-[9px] font-bold uppercase text-black/40">
                             Written by: {post.author || "Pairo Studio"}
                          </div>
                       </div>
                    </div>
                  )}
               </aside>
            </div>
         </div>
      </div>

      <section className="bg-[#FBFBFB] py-12 md:py-16 border-y border-black/5 overflow-hidden">
         <div className="container mx-auto px-2 sm:px-4 md:px-8">
            <div className="flex items-end justify-between mb-8">
               <div className="space-y-1">
                  <span className="text-[8px] font-bold tracking-[0.2em] text-black/30 uppercase">DISCOVER MORE</span>
                  <h2 className="text-lg md:text-xl font-bold heading-font text-black uppercase">RELATED STORIES</h2>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => scroll("left")} className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${canScrollLeft ? "text-black hover:bg-black hover:text-white" : "text-black/30 cursor-default"}`}><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => scroll("right")} className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all ${canScrollRight ? "text-black hover:bg-black hover:text-white" : "text-black/30 cursor-default"}`}><ChevronRight className="w-4 h-4" /></button>
               </div>
            </div>
            <div className="relative -mx-4 md:-mx-0">
               <div ref={carouselRef} className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 md:px-0">
                  {posts.map((rPost) => (
                    <div key={rPost.id} className="w-[70vw] sm:w-[35vw] md:w-[25vw] lg:w-[20vw] shrink-0 snap-start">
                      <BlogCard post={rPost} />
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      <section className="py-12 md:py-16 bg-white border-t border-black/5">
         <div className="container mx-auto px-2 sm:px-4 md:px-8 text-center space-y-4">
            <span className="text-black/20 text-[8px] font-bold uppercase tracking-[0.3em]">NEXT ENTRY</span>
            {posts.length > 0 && (
               <Link href={`/blog/${posts[0].slug}`} className="group block">
                  <h2 className="text-lg md:text-2xl font-bold heading-font tracking-tighter uppercase text-black leading-tight transition-all duration-700 group-hover:text-black/30">
                    {posts[0].title}
                  </h2>
                  <div className="mt-4 inline-flex items-center gap-2 text-black font-bold text-[8px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                     Read next story
                     <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
               </Link>
            )}
         </div>
      </section>
    </main>
  );
}
