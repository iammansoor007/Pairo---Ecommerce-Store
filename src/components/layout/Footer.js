"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Camera, MessageSquare, Globe } from "lucide-react";
import { motion } from "framer-motion";
import siteData from "@/lib/data.json";
import logo from "../../assets/png-file.png";

export default function Footer() {
  const { footer, blogs, categories } = siteData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    })
  };

  return (
    <footer className="bg-[var(--black)] text-[var(--sand)] pt-16 md:pt-24 pb-12 overflow-hidden relative z-10 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-16 relative z-20">
        
        {/* Top Header */}
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: false }}
           variants={containerVariants}
           className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 pb-12 border-b border-white/5"
        >
           <motion.div variants={itemVariants}>
              <Link href="/" className="flex-shrink-0">
                 <Image 
                   src={logo} 
                   alt="Pairo Logo" 
                   width={110} 
                   height={40} 
                   className="object-contain" 
                 />
              </Link>
           </motion.div>
           <motion.div variants={itemVariants} className="flex items-center gap-8">
              <Link href="#" className="text-[var(--sand)]/30 hover:text-[var(--sand)] transition-colors">
                 <Camera className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[var(--sand)]/30 hover:text-[var(--sand)] transition-colors">
                 <MessageSquare className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-[var(--sand)]/30 hover:text-[var(--sand)] transition-colors">
                 <Globe className="w-5 h-5" />
              </Link>
           </motion.div>
        </motion.div>

        {/* 4-Column Grid */}
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: false }}
           variants={containerVariants}
           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-16"
        >
           {/* Elite List */}
           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[var(--sand)]/30 uppercase tracking-[0.4em]">Elite List</h3>
              <div className="relative group max-w-sm">
                 <input 
                   type="email" 
                   placeholder="JOIN THE ARCHIVE"
                   className="w-full bg-transparent border-b border-white/10 py-3 px-0 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-[var(--sand)] transition-colors uppercase text-[var(--sand)]"
                 />
                 <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--sand)]/20 group-hover:text-[var(--sand)] transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                 </button>
              </div>
           </motion.div>

           {/* Editorial */}
           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[var(--sand)]/30 uppercase tracking-[0.4em]">Editorial</h3>
              <ul className="space-y-3">
                 {blogs.posts.slice(0, 4).map((post) => (
                    <li key={post.id}>
                       <Link href={`/blog/${post.slug}`} className="text-[var(--sand)]/40 hover:text-[var(--sand)] font-bold text-[9px] uppercase tracking-widest transition-colors block">
                          {post.title}
                       </Link>
                    </li>
                 ))}
              </ul>
           </motion.div>

           {/* Collections */}
           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[var(--sand)]/30 uppercase tracking-[0.4em]">Collections</h3>
              <ul className="space-y-3">
                 {categories.items.map((cat) => (
                    <li key={cat.slug}>
                       <Link href={`/shop?category=${cat.slug}`} className="text-[var(--sand)]/40 hover:text-[var(--sand)] font-bold text-[9px] uppercase tracking-widest transition-colors block">
                          {cat.name}
                       </Link>
                    </li>
                 ))}
              </ul>
           </motion.div>

           {/* Information */}
           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[var(--sand)]/30 uppercase tracking-[0.4em]">Information</h3>
              <ul className="space-y-3">
                 <li key="f-about"><Link href="/about" className="text-[var(--sand)]/40 hover:text-[var(--sand)] font-bold text-[9px] uppercase tracking-widest transition-colors block">Our Story</Link></li>
                 <li key="f-contact"><Link href="/contact" className="text-[var(--sand)]/40 hover:text-[var(--sand)] font-bold text-[9px] uppercase tracking-widest transition-colors block">Contact</Link></li>
                 {footer.sections[1].links.map((link) => (
                    <li key={`inf-${link.name}`}>
                       <Link href={link.href} className="text-[var(--sand)]/40 hover:text-[var(--sand)] font-bold text-[9px] uppercase tracking-widest transition-colors block">
                          {link.name}
                       </Link>
                    </li>
                 ))}
              </ul>
           </motion.div>
        </motion.div>
      </div>

      {/* Massive Brand Reveal - High Visibility Reveal */}
      <div className="relative my-8 md:my-12">
         <div className="text-center px-4">
            <div className="text-[25vw] font-bold heading-font leading-[0.75] uppercase tracking-tighter text-[var(--sand)] inline-flex justify-center flex-wrap">
               {"PAIRO".split("").map((letter, i) => (
                 <motion.span 
                    key={`letter-${i}`}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.1 }}
                    variants={letterVariants}
                    className="inline-block"
                 >
                    {letter}
                 </motion.span>
               ))}
            </div>
         </div>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="container mx-auto px-6 md:px-16 relative z-20">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
            <p className="text-[var(--sand)]/20 text-[9px] font-bold uppercase tracking-widest">
               PAIRO — ALL RIGHTS RESERVED © 2026.
            </p>
            <div className="flex gap-10">
               <Link href="#" className="text-[var(--sand)]/20 hover:text-[var(--sand)] text-[9px] font-bold uppercase tracking-widest transition-colors">Privacy</Link>
               <Link href="#" className="text-[var(--sand)]/20 hover:text-[var(--sand)] text-[9px] font-bold uppercase tracking-widest transition-colors">Terms</Link>
            </div>
         </div>
      </div>
    </footer>
  );
}
