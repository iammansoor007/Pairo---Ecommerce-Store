"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import siteData from "@/lib/data.json";
import MarqueeSection from "@/components/home/MarqueeSection";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

export default function ContactPage() {
  const { contact } = siteData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <main className="bg-white">
      {/* Hero Section - Synchronized with Main Hero Style */}
      <section className="relative h-[550px] md:h-[650px] lg:h-[750px] overflow-hidden mx-4 md:mx-8 my-6 rounded-[32px] md:rounded-[40px] shadow-2xl bg-black">
        <div className="absolute inset-0">
          <Image
            src={contact.hero.image}
            alt="Contact Pairo"
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
                  {contact.hero.label}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white heading-font leading-[0.95] tracking-tighter uppercase">
                {contact.hero.title}
              </h1>

              <p className="text-white/50 text-sm md:text-xl max-w-xl leading-relaxed font-sans">
                {contact.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <button className="group relative overflow-hidden bg-white text-black px-10 md:px-12 py-4 md:py-5 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-xl active:scale-95">
                  <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-500">
                    {contact.hero.buttonText}
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

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-20">
            
            {/* Contact Information */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="space-y-16"
            >
              <div className="space-y-8">
                <motion.div variants={itemVariants} className="space-y-4">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-black/30 uppercase">{contact.details.office.label}</span>
                  <h2 className="text-4xl md:text-5xl font-bold heading-font tracking-tighter uppercase leading-none">
                    {contact.details.office.title}
                  </h2>
                  <p className="text-lg md:text-xl text-black/60 leading-relaxed max-w-sm">
                    {contact.details.office.address}
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-8 pt-8">
                  {contact.details.channels.map((channel, i) => (
                    <motion.div key={i} variants={itemVariants} className="p-8 rounded-3xl bg-black/[0.02] border border-black/[0.05] space-y-4">
                      <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{channel.label}</span>
                      <p className="text-lg font-bold tracking-tight">{channel.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div variants={itemVariants} className="space-y-8 pt-8 border-t border-black/5">
                <span className="text-[10px] font-bold tracking-[0.3em] text-black/30 uppercase">{contact.details.socialLabel}</span>
                <div className="flex gap-4">
                  <button className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-lg active:scale-90">
                    <InstagramIcon />
                  </button>
                  <button className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-lg active:scale-90">
                    <TwitterIcon />
                  </button>
                  <button className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-lg active:scale-90">
                    <LinkedinIcon />
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black text-white p-8 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-bold heading-font uppercase tracking-tighter">{contact.form.title}</h3>
                  <p className="text-white/40 text-sm uppercase tracking-widest">{contact.form.subtitle}</p>
                </div>

                <form className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Name</label>
                      <input type="text" className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email</label>
                      <input type="email" className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Subject</label>
                    <select className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm appearance-none cursor-pointer">
                      {contact.form.subjects.map(sub => (
                        <option key={sub} className="bg-black text-white">{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Message</label>
                    <textarea rows="4" className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm resize-none" placeholder="Your message here..."></textarea>
                  </div>

                  <button className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#FFC633] transition-all active:scale-[0.98]">
                    {contact.form.buttonText}
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Grid Location Visual */}
      <section className="px-4 md:px-8 pb-12">
         <div className="bg-black rounded-[32px] md:rounded-[48px] overflow-hidden relative min-h-[400px] md:min-h-[600px] flex items-center justify-center text-center p-8">
            <Image src={contact.map.image} alt="Location" fill className="object-cover opacity-30" />
            <div className="relative z-10 max-w-2xl space-y-6">
               <h3 className="text-4xl md:text-6xl font-bold heading-font text-white uppercase tracking-tighter">{contact.map.title}</h3>
               <p className="text-lg text-white/50 leading-relaxed">{contact.map.description}</p>
               <div className="pt-6">
                  <button className="px-10 py-4 border border-white/20 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                     {contact.details.stores.buttonText}
                  </button>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
