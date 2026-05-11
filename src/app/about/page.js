"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import siteData from "@/lib/data.json";
import MarqueeSection from "@/components/home/MarqueeSection";

export default function AboutPage() {
  const { about, brand } = siteData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <main className="bg-white">
      {/* Hero Section - Synchronized with Main Hero Style */}
      <section className="relative h-[550px] md:h-[650px] lg:h-[750px] overflow-hidden mx-4 md:mx-8 my-6 rounded-[32px] md:rounded-[40px] shadow-2xl bg-black">
        <div className="absolute inset-0">
          <Image
            src={about.hero.image}
            alt="About Pairo"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>

        {/* Luxury Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

        {/* Content Area */}
        <div className="container mx-auto px-6 md:px-16 h-full flex items-center relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 md:space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="h-[1.5px] w-8 bg-white/30" />
                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase heading-font">
                  {about.hero.label}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white heading-font leading-[0.95] tracking-tighter uppercase">
                {about.hero.title}
              </h1>

              <p className="text-white/50 text-sm md:text-xl max-w-xl leading-relaxed font-sans">
                {about.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <button className="group relative overflow-hidden bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-xl active:scale-95">
                  <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-500">
                    {about.hero.buttonText}
                    <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee Synchronization */}
        <MarqueeSection />
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="space-y-10"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-black" />
                   <span className="text-[10px] font-bold tracking-[0.3em] text-black/30 uppercase">{about.story.label}</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold heading-font tracking-tighter text-black uppercase leading-[0.9]">
                  {about.story.title}
                </h2>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-black/60 leading-relaxed max-w-xl">
                {about.story.description}
              </motion.p>

              <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-8 pt-6">
                {about.story.features.map((feature, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-black/[0.02] border border-black/[0.05] space-y-4 hover:bg-black hover:text-white transition-all duration-500 group">
                    <h3 className="text-lg font-bold uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-sm opacity-60 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl"
            >
              <Image 
                src={about.story.image}
                alt="Craftsmanship"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Reveal Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
               <span className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">{about.studio.label}</span>
               <h2 className="text-4xl md:text-6xl font-bold heading-font tracking-tighter uppercase leading-none">
                 {about.studio.title}
               </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {about.studio.images.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden group"
              >
                <Image src={img} alt="Studio" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise Section - High Impact */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-16">
          <div className="bg-black rounded-[40px] md:rounded-[60px] overflow-hidden relative min-h-[500px] md:min-h-[700px] flex items-center">
            <div className="absolute inset-0">
               <Image src={about.promise.image} alt="Promise" fill className="object-cover opacity-50" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            </div>

            <div className="relative z-10 w-full p-8 md:p-20">
               <div className="max-w-2xl space-y-12">
                  <div className="space-y-4">
                     <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">{about.promise.label}</span>
                     <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold heading-font text-white uppercase leading-[0.9] tracking-tighter">
                        {about.promise.title}
                     </h2>
                  </div>
                  
                  <p className="text-lg md:text-2xl text-white/60 leading-relaxed font-light">
                    {about.promise.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-12 pt-12 border-t border-white/10">
                     {about.promise.items.map((item, i) => (
                       <div key={i} className="space-y-4">
                          <h4 className="text-xl font-bold uppercase tracking-tight text-white">{item.title}</h4>
                          <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                       </div>
                     ))}
                  </div>

                  <div className="flex gap-16 pt-8">
                     {about.promise.stats.map((stat, i) => (
                       <div key={i}>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className="text-3xl md:text-4xl font-bold heading-font text-white">{stat.value}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer CTA */}
      <section className="py-24 border-t border-black/5">
         <div className="container mx-auto px-6 md:px-16 text-center">
            <h2 className="text-4xl md:text-7xl font-bold heading-font tracking-tighter uppercase mb-12">
               {about.cta.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
               <Link href="/shop" className="px-12 py-5 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black/80 transition-all active:scale-95">
                  {about.cta.shopNow}
               </Link>
               <Link href="/contact" className="px-12 py-5 border border-black text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95">
                  {about.cta.contactUs}
               </Link>
            </div>
         </div>
      </section>
    </main>
  );
}
