"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

export default function ContactSection({ 
  officeLabel = "HEADQUARTERS",
  officeTitle = "VISIT THE ATELIER",
  address = "123 Artisan Row, Florence, Italy 50123",
  channels = [
    { label: "General Inquiries", value: "concierge@pairo.com" },
    { label: "Press & Media", value: "press@pairo.com" }
  ],
  socialLabel = "FOLLOW OUR JOURNEY",
  formTitle = "SEND A MESSAGE",
  formSubtitle = "DIRECT CONCIERGE LINE",
  subjects = "General Inquiry, Order Status, Bespoke Request, Wholesale",
  buttonText = "DISPATCH MESSAGE"
}) {
  const subjectList = typeof subjects === 'string' 
    ? subjects.split(',').map(s => s.trim()) 
    : Array.isArray(subjects) ? subjects : ["General Inquiry"];

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: subjectList[0],
    message: "",
    hp_field: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sourcePage: window.location.pathname
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Message sent!");
        setFormData({ name: "", email: "", subject: subjects[0], message: "", hp_field: "" });
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section id="contact-form" className="py-12 md:py-16">
      <div className="mx-4 md:mx-8 bg-white border border-black/5 rounded-[32px] md:rounded-[40px] shadow-sm overflow-hidden py-16 md:py-24 px-6 md:px-16">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Contact Information */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="space-y-16">
            <div className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.3em] text-black/30 uppercase">{officeLabel}</span>
                <h2 className="text-4xl md:text-5xl font-bold heading-font tracking-tighter uppercase leading-none">{officeTitle}</h2>
                <p className="text-lg md:text-xl text-black/60 leading-relaxed max-w-sm">{address}</p>
              </motion.div>
              <div className="grid sm:grid-cols-2 gap-8 pt-8">
                {channels.map((channel, i) => (
                  <motion.div key={i} variants={itemVariants} className="p-8 rounded-3xl bg-black/[0.02] border border-black/[0.05] space-y-4">
                    <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">{channel.label}</span>
                    <p className="text-lg font-bold tracking-tight">{channel.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div variants={itemVariants} className="space-y-8 pt-8 border-t border-black/5">
              <span className="text-[10px] font-bold tracking-[0.3em] text-black/30 uppercase">{socialLabel}</span>
              <div className="flex gap-4">
                <button className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-lg active:scale-90"><InstagramIcon /></button>
                <button className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-lg active:scale-90"><TwitterIcon /></button>
                <button className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 shadow-lg active:scale-90"><LinkedinIcon /></button>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="bg-black text-white p-8 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-12">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold heading-font uppercase tracking-tighter">{formTitle}</h3>
                <p className="text-white/40 text-sm uppercase tracking-widest">{formSubtitle}</p>
              </div>
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm appearance-none cursor-pointer">
                    {subjectList.map(sub => (<option key={sub} className="bg-black text-white">{sub}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Message</label>
                  <textarea required rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border-b border-white/10 py-4 px-4 rounded-xl focus:outline-none focus:border-white transition-colors text-sm resize-none" placeholder="Your message here..."></textarea>
                </div>
                <input type="text" className="hidden" value={formData.hp_field} onChange={e => setFormData({...formData, hp_field: e.target.value})} tabIndex="-1" autoComplete="off" />
                <button disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#FFC633] transition-all active:scale-[0.98] disabled:opacity-50">
                  {loading ? "Sending..." : buttonText}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
