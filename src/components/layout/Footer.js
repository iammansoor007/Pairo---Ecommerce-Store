"use client";

import { useSiteData } from "@/context/SiteContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Camera, MessageSquare, Globe } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/png-file.png";

export default function Footer() {
  const siteData = useSiteData();
  
  if (!siteData) return null;
  const { footer, categories } = siteData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: i => ({
      opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }
    })
  };

  return (
    <footer className="bg-black text-[#E6E2D3] pt-16 md:pt-24 pb-12 overflow-hidden relative z-10 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-16 relative z-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: false }} variants={containerVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 pb-12 border-b border-white/5">
           <motion.div variants={itemVariants}>
              <Link href="/" className="flex-shrink-0">
                 <Image src={logo} alt="Pairo Logo" width={110} height={40} className="object-contain" />
              </Link>
           </motion.div>
           <motion.div variants={itemVariants} className="flex items-center gap-8">
              <Link href="#" className="text-[#E6E2D3]/30 hover:text-[#E6E2D3] transition-colors"><Camera className="w-5 h-5" /></Link>
              <Link href="#" className="text-[#E6E2D3]/30 hover:text-[#E6E2D3] transition-colors"><MessageSquare className="w-5 h-5" /></Link>
              <Link href="#" className="text-[#E6E2D3]/30 hover:text-[#E6E2D3] transition-colors"><Globe className="w-5 h-5" /></Link>
           </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: false }} variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[#E6E2D3]/30 uppercase tracking-[0.4em]">Elite List</h3>
              <div className="relative group max-w-sm">
                 <input type="email" placeholder="JOIN THE LIST" className="w-full bg-transparent border-b border-white/10 py-3 px-0 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-[#E6E2D3] transition-colors uppercase" />
                 <button className="absolute right-0 top-1/2 -translate-y-1/2 text-[#E6E2D3]/20 group-hover:text-[#E6E2D3] transition-colors"><ArrowUpRight className="w-4 h-4" /> </button>
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[#E6E2D3]/30 uppercase tracking-[0.4em]">Information</h3>
              <ul className="space-y-3">
                 <li><Link href="/about" className="text-[#E6E2D3]/40 hover:text-[#E6E2D3] font-bold text-[9px] uppercase tracking-widest transition-colors block">Our Story</Link></li>
                 <li><Link href="/contact" className="text-[#E6E2D3]/40 hover:text-[#E6E2D3] font-bold text-[9px] uppercase tracking-widest transition-colors block">Contact</Link></li>
                 {footer.sections[1].links.map((link) => (
                    <li key={link.name}><Link href={link.href} className="text-[#E6E2D3]/40 hover:text-[#E6E2D3] font-bold text-[9px] uppercase tracking-widest transition-colors block">{link.name}</Link></li>
                 ))}
              </ul>
           </motion.div>

           <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-[10px] font-bold text-[#E6E2D3]/30 uppercase tracking-[0.4em]">Collections</h3>
              <ul className="space-y-3">
                 {categories.items.map((cat) => (
                    <li key={cat.slug}><Link href={`/shop?category=${cat.slug}`} className="text-[#E6E2D3]/40 hover:text-[#E6E2D3] font-bold text-[9px] uppercase tracking-widest transition-colors block">{cat.name}</Link></li>
                 ))}
              </ul>
           </motion.div>
        </motion.div>
      </div>

      <div className="relative my-8 md:my-12">
         <div className="text-center px-4">
            <div className="text-[25vw] font-bold heading-font leading-[0.75] uppercase tracking-tighter text-[#E6E2D3] inline-flex justify-center flex-wrap">
               {"PAIRO".split("").map((letter, i) => (
                 <motion.span key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={letterVariants} className="inline-block">{letter}</motion.span>
               ))}
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 md:px-16 relative z-20">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
            <p className="text-[#E6E2D3]/20 text-[9px] font-bold uppercase tracking-widest">PAIRO — ALL RIGHTS RESERVED © 2026.</p>
            <div className="flex gap-10">
               <Link href="#" className="text-[#E6E2D3]/20 hover:text-[#E6E2D3] text-[9px] font-bold uppercase tracking-widest transition-colors">Privacy</Link>
               <Link href="#" className="text-[#E6E2D3]/20 hover:text-[#E6E2D3] text-[9px] font-bold uppercase tracking-widest transition-colors">Terms</Link>
            </div>
         </div>
      </div>
    </footer>
  );
}
