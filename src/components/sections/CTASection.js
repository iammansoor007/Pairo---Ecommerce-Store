"use client";

import Link from "next/link";

export default function CTASection({
  title = "EXPERIENCE THE FUTURE OF DESIGN",
  primaryBtnLabel = "Shop Collection",
  primaryBtnLink = "/shop",
  secondaryBtnLabel = "Contact Us",
  secondaryBtnLink = "/contact"
}) {

  return (
    <section className="py-12 md:py-24">
       <div className="mx-4 md:mx-8 bg-white border border-black/5 rounded-[32px] md:rounded-[40px] shadow-sm overflow-hidden py-24 px-6 md:px-16 text-center">
          <h2 className="text-4xl md:text-7xl font-bold heading-font tracking-tighter uppercase mb-12">
             {title}
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
             <Link href={primaryBtnLink} className="px-12 py-5 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black/80 transition-all active:scale-95 inline-block">
                {primaryBtnLabel}
             </Link>
             <Link href={secondaryBtnLink} className="px-12 py-5 border border-black text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95 inline-block">
                {secondaryBtnLabel}
             </Link>
          </div>
       </div>
    </section>
  );
}
