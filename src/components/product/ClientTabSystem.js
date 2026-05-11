"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Star, User, Check, HelpCircle } from "lucide-react";

export default function ClientTabSystem({ product }) {
  const [activeTab, setActiveTab] = useState("Product Details");

  const reviews = [
    { name: "Samantha D.", date: "August 14, 2023", text: "I absolutely love this jacket! The design is unique and the fabric feels so comfortable." },
    { name: "Alex M.", date: "August 15, 2023", text: "The quality exceeded my expectations! The colors are vibrant and the craft quality is top-notch." },
    { name: "Ethan R.", date: "August 16, 2023", text: "This is a must-have for anyone who appreciates good design. Minimalistic yet stylish." }
  ];

  const renderStars = (rating, size = "w-3 h-3") => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`${size} ${i < Math.floor(rating) ? 'fill-[#FFC633] text-[#FFC633]' : 'fill-black/5 text-black/5'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="mt-12 md:mt-20 border-t border-black/5">
      <div className="flex border-b border-black/5 overflow-x-auto scrollbar-hide snap-x">
         {["Product Details", "Rating & Reviews", "FAQs"].map((tab) => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`flex-1 min-w-[120px] md:min-w-[200px] py-6 md:py-8 text-xs md:text-xl font-medium transition-all relative snap-center ${activeTab === tab ? "text-black" : "text-black/40"}`}
           >
             {tab}
             {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />}
           </button>
         ))}
      </div>
      
      <div className="py-8 md:py-12 min-h-[300px] md:min-h-[400px]">
         <AnimatePresence mode="wait">
            {activeTab === "Product Details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-4 md:space-y-6">
                   <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-black/20" />
                      <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Craftsmanship Narrative</h3>
                   </div>
                   <p className="text-black/60 text-xs md:text-base leading-relaxed font-medium">
                      {product.details || "Handcrafted with the finest selection of shearling, this piece represents the pinnacle of Pairo design."}
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                   {[
                      { l: "Exterior", v: "Grain Leather" },
                      { l: "Interior", v: "100% Shearling" },
                      { l: "Zippers", v: "Riri Brass" },
                      { l: "Service", v: "Lifetime" }
                   ].map((s, i) => (
                      <div key={i} className="pb-2 md:pb-4 border-b border-black/5">
                         <p className="text-[7px] font-bold text-black/20 uppercase tracking-widest mb-1">{s.l}</p>
                         <p className="text-[9px] md:text-[10px] font-bold uppercase">{s.v}</p>
                      </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Rating & Reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 md:space-y-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-black">Verified Reviews</h2>
                   <button className="w-full sm:w-auto h-10 px-6 bg-black text-white rounded-lg font-bold text-[8px] md:text-[9px] uppercase tracking-widest">Submit Perspective</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                   {reviews.map((review, i) => (
                     <div key={i} className="p-5 md:p-6 bg-[#F9F9F9] border border-black/5 rounded-xl space-y-4 md:space-y-6">
                        <div className="flex justify-between items-center"><div className="flex gap-0.5">{renderStars(5, "w-3 h-3")}</div><span className="text-[7px] md:text-[8px] font-bold text-black/20 uppercase tracking-widest">{review.date}</span></div>
                        <div className="space-y-3"><div className="flex items-center gap-2"><div className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center"><User className="w-3 h-3 text-black/40" /></div><h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-tight">{review.name}</h4><Check className="w-2.5 h-2.5 text-emerald-500" /></div><p className="text-black/60 text-[11px] md:text-sm leading-relaxed font-medium italic">"{review.text}"</p></div>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === "FAQs" && (
              <motion.div key="faqs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl space-y-2 md:space-y-3">
                 {(product.faqs && product.faqs.length > 0) ? (
                   product.faqs.map((faq, index) => (
                     <div key={index} className="p-5 md:p-6 bg-[#F9F9F9] rounded-xl border border-black/5 hover:border-black/10 transition-all">
                        <div className="flex gap-3 md:gap-4 items-start"><HelpCircle className="w-4 h-4 text-black/20 mt-0.5" /><div className="space-y-2 md:space-y-3"><h4 className="text-[9px] md:text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{faq.q}</h4><p className="text-black/80 font-bold text-[11px] md:text-sm leading-relaxed tracking-tight">{faq.a}</p></div></div>
                     </div>
                   ))
                 ) : (
                   <p className="text-black/30 font-bold uppercase tracking-widest text-[8px] md:text-[9px] text-center py-12 md:py-20">No specific FAQs for this piece</p>
                 )}
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
