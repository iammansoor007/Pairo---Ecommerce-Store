"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Star, User, Check, HelpCircle, ChevronDown, MessageSquareText } from "lucide-react";

import dynamic from "next/dynamic";

const ProductReviews = dynamic(() => import("./ProductReviews"), {
  ssr: false,
  loading: () => (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 animate-pulse">Loading Reviews Engine...</span>
    </div>
  )
});

export default function ClientTabSystem({ product }) {
  const [activeTab, setActiveTab] = useState("Product Details");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="mt-12 md:mt-20 border-t border-black/5">
      <div className="flex border-b border-black/5 overflow-x-auto scrollbar-hide snap-x">
         {["Product Details", "Rating & Reviews", "FAQs"].map((tab) => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`flex-1 min-w-[120px] md:min-w-[200px] py-5 md:py-6 text-xs md:text-xs font-medium uppercase tracking-[0.2em] transition-all relative snap-center ${activeTab === tab ? "text-[#1E1B19] border-b border-[#1E1B19]" : "text-[#6F655B]/50 hover:text-[#1E1B19]"}`}
           >
             {tab}
           </button>
         ))}
      </div>
      
      <div className="py-8 md:py-16 min-h-[300px] md:min-h-[400px]">
         <AnimatePresence mode="wait">
            {activeTab === "Product Details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-12">
                 <div>
                    <div 
                       className="text-[#6F655B] text-sm md:text-base leading-relaxed font-normal prose-custom max-w-none"
                       dangerouslySetInnerHTML={{ __html: product.description || "Detailed overview coming soon..." }}
                     />
                 </div>

                 {/* Technical Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12 border-t border-black/5">
                    {[
                       { l: "SKU Identifier", v: product.sku || "N/A" },
                       { l: "Department", v: product.categories?.[0]?.name || product.category || "General" },
                       { l: "Stock Status", v: product.status || "Published" },
                       { l: "Logistics", v: product.shippingType || "Express" }
                    ].map((s, i) => (
                       <div key={i} className="space-y-1.5">
                          <p className="text-[8px] font-medium text-[#6F655B]/60 uppercase tracking-widest">{s.l}</p>
                          <p className="text-[11px] font-medium uppercase text-[#1E1B19] tracking-wider">{s.v}</p>
                       </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "Rating & Reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProductReviews productId={product._id} productName={product.name} />
              </motion.div>
            )}

            {activeTab === "FAQs" && (
              <motion.div key="faqs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto space-y-3">
                  {(product.faqs && product.faqs.length > 0) ? (
                    product.faqs.map((faq, index) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div 
                          key={index} 
                          className={`rounded-[var(--radius,0px)] border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-white border-[#1E1B19]/45' : 'bg-transparent border-[#E3DACB] hover:border-[#1E1B19]/35'}`}
                        >
                           <button 
                             onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                             className="w-full px-5 py-5 md:px-6 md:py-6 flex items-center justify-between text-left group"
                           >
                             <div className="flex items-center gap-4">
                               <div className={`w-8 h-8 rounded-[var(--radius,0px)] flex items-center justify-center transition-colors ${isOpen ? 'bg-[#1E1B19]' : 'bg-white border border-[#E3DACB]'}`}>
                                 <HelpCircle className={`w-3.5 h-3.5 ${isOpen ? 'text-white' : 'text-[#6F655B]'}`} />
                               </div>
                               <h4 className="text-xs md:text-sm font-medium uppercase tracking-wider text-[#1E1B19]">
                                 {faq.question}
                               </h4>
                             </div>
                             <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'text-[#1E1B19] rotate-180' : 'text-[#6F655B]/40'}`} />
                           </button>
                           
                           <AnimatePresence>
                             {isOpen && (
                               <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: "auto", opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 transition={{ duration: 0.25, ease: "easeInOut" }}
                               >
                                 <div className="px-5 pb-6 pl-17 md:px-6 md:pb-8 md:pl-18 border-t border-[#E3DACB]/30 pt-4">
                                    <p className="text-[#6F655B] font-normal text-xs md:text-sm leading-relaxed tracking-normal max-w-2xl">
                                      {faq.answer}
                                    </p>
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 bg-white rounded-[var(--radius,0px)] border border-dashed border-[#E3DACB]">
                       <MessageSquareText className="w-8 h-8 text-[#6F655B]/20 mx-auto mb-4" />
                       <p className="text-[#6F655B]/60 font-medium uppercase tracking-widest text-[9px] mb-1">No specific FAQs for this piece</p>
                       <p className="text-[11px] text-[#6F655B]/40 font-light">Contact our concierge for specific inquiries.</p>
                    </div>
                  )}
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <style jsx global>{`
        .prose-custom > * { margin-top: 0; margin-bottom: 1.25rem; }
        .prose-custom > *:last-child { margin-bottom: 0; }
        .prose-custom h1 { font-size: 1.5rem; font-weight: 600; line-height: 1.2; margin-top: 2rem; color: #1E1B19; }
        .prose-custom h2 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; margin-top: 1.5rem; color: #1E1B19; }
        .prose-custom p { margin-bottom: 1rem; line-height: 1.7; color: #6F655B; }
        .prose-custom ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1rem; }
        .prose-custom ol { list-style-type: decimal; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 1rem; }
        .prose-custom li { margin-bottom: 0.25rem; color: #6F655B; }
        .prose-custom li p { margin-bottom: 0 !important; margin-top: 0 !important; }
        .prose-custom blockquote { border-left: 2px solid #E3DACB; padding-left: 1.5rem; font-style: italic; color: #6F655B; margin: 2rem 0; }
        .prose-custom strong { font-weight: 600; color: #1E1B19; }
        .prose-custom *:first-child { margin-top: 0 !important; }
      `}</style>
    </div>
  );
}
