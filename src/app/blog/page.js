import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Plus, ArrowRight } from "lucide-react";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

import { resolveSEOMetadata, escapeJsonLd } from "@/lib/seo-resolver";
import Page from "@/models/Page";
import BlogNewsletterForm from "./BlogNewsletterForm";

export async function generateMetadata() {
  await dbConnect();
  const page = await Page.findOne({ slug: "blog" }).lean();
  
  const { metadata } = resolveSEOMetadata({
    entity: page || {},
    type: "page",
    fallbackTitle: "Journal | Pairo Editorial",
    fallbackDesc: "Explore the stories, craftsmanship, and heritage behind Pairo's archival shearling collection.",
    path: "/blog"
  });
  
  return metadata;
}

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
    <div className="mt-4 space-y-1.5 px-0.5">
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
        className="text-[15px] sm:text-[17px] font-black uppercase tracking-wide text-black transition-colors group-hover:underline decoration-1 underline-offset-4 leading-snug"
      >
        {post.title}
      </h3>
    </div>
  </Link>
);

export default async function BlogArchive() {
  await dbConnect();
  
  const dbBlogs = await Blog.find({ 
    status: 'Published', 
    isDeleted: { $ne: true },
    tenantId: 'DEFAULT_STORE' 
  }).sort({ createdAt: -1 }).lean();

  const posts = dbBlogs.map(b => ({
    id: b._id.toString(),
    title: b.title,
    slug: b.slug,
    image: b.image,
    category: b.category,
    date: new Date(b.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }));

  const page = await Page.findOne({ slug: "blog", status: "Published" }).lean();
  const { structuredData } = resolveSEOMetadata({
    entity: page || {},
    type: "page",
    fallbackTitle: "Journal | Pairo Editorial",
    fallbackDesc: "Explore the stories, craftsmanship, and heritage behind Pairo's archival shearling collection.",
    path: "/blog"
  });

  return (
    <main className="bg-white min-h-screen text-black">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(structuredData) }}
        />
      )}
      <section className="pt-24 pb-12 border-b border-black/[0.06]">
         <div className="container mx-auto px-2 sm:px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-3 max-w-3xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-400">
                     Pairo Archive & Journal
                  </p>
                  <h1 className="text-[36px] md:text-[60px] font-extrabold heading-font tracking-tight text-black uppercase leading-none">
                     EDITORIAL STORIES
                  </h1>
               </div>
               <div className="text-right">
                  <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase block">VOLUME 2026 // EDITION 0.1</span>
               </div>
            </div>
         </div>
      </section>

      <section className="py-12 md:py-20">
         <div className="container mx-auto px-2 sm:px-4 md:px-8">
            {posts.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-[4px] border border-black/[0.04]">
                <p className="text-xs font-black uppercase tracking-wider text-neutral-400">No Editorial Stories Published Yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-8">
                 {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                 ))}
              </div>
            )}
         </div>
      </section>

      <section className="py-16 md:py-24 bg-[#FAF9F6] border-t border-black/[0.06]">
         <div className="container mx-auto px-2 sm:px-4 md:px-8 text-center max-w-xl">
            <span className="text-neutral-400 text-[9px] font-black uppercase tracking-[0.4em] mb-4 block">THE ELITE LIST</span>
            <h2 className="text-2xl md:text-[32px] font-extrabold heading-font tracking-tight text-black uppercase mb-8 leading-tight">
               Subscribe to receive <br /> exclusive archive previews.
            </h2>
            <BlogNewsletterForm />
         </div>
      </section>
    </main>
  );
}
