"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from '../../assets/png-file.png';
import siteData from "@/lib/data.json";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeOffer, setActiveOffer] = useState(0);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  const { brand, navigation, categories } = siteData;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const offerInterval = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % navigation.offers.length);
    }, 4000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(offerInterval);
    };
  }, [navigation.offers.length]);

  return (
    <>
      {/* Top Carousel Banner */}
      <div className="bg-black text-white text-center py-2 text-xs md:text-sm font-medium relative overflow-hidden h-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOffer}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center font-sans tracking-wide"
          >
            {navigation.offers[activeOffer]}
          </motion.div>
        </AnimatePresence>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b border-black/5 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-4" : "bg-white py-6"
          }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image src={logo} alt="Pairo Logo" width={100} height={35} className="object-contain" priority quality={85} />
              </Link>
            </div>

            {/* Center: Menu Links (Desktop) */}
            <div className="hidden lg:flex flex-1 justify-center items-center space-x-12">
              {navigation.links.map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => link.hasMegaMenu && setShowMegaMenu(true)}
                  onMouseLeave={() => link.hasMegaMenu && setShowMegaMenu(false)}
                >
                  <Link
                    href={link.href}
                    className="text-[13px] font-bold uppercase tracking-[0.2em] hover:text-black/60 transition-colors flex items-center gap-2 font-sans"
                  >
                    {link.name}
                    {link.hasMegaMenu && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>

                  {/* Mega Menu */}
                  {link.hasMegaMenu && (
                    <AnimatePresence>
                      {showMegaMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-6 w-[700px]"
                        >
                          <div className="bg-white border border-black/5 shadow-2xl rounded-[32px] p-10 grid grid-cols-3 gap-10">
                            {categories.map((cat) => (
                              <Link
                                key={cat.name}
                                href={`/shop?category=${cat.slug}`}
                                className="group/item"
                              >
                                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-5 bg-[var(--secondary)]">
                                  <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    sizes="200px"
                                    className="object-cover transition-transform duration-700 group-hover/item:scale-110"
                                    quality={60}
                                  />
                                  <div className="absolute inset-0 bg-black/10 group-hover/item:bg-black/0 transition-colors duration-500" />
                                </div>
                                <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] heading-font">{cat.name}</h4>
                                <p className="text-[8px] text-black/30 font-bold tracking-widest mt-1">DISCOVER</p>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Icons */}
            <div className="flex items-center space-x-2 md:space-x-6">
              <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/cart" className="p-2 relative hover:bg-black/5 rounded-full transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute top-1 right-1 bg-black text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  2
                </span>
              </Link>
              <Link href="/login" className="hidden lg:flex p-2 hover:bg-black/5 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button
                className="lg:hidden p-2 hover:bg-black/5 rounded-full"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-white flex flex-col h-full"
          >
            {/* Mobile Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Image src={logo} alt="Logo" width={90} height={32} quality={85} />
              </Link>
              <button onClick={() => setIsOpen(false)} className="p-3 bg-black/5 rounded-full hover:bg-black hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Links Scrollable Area */}
            <div className="flex-1 overflow-y-auto pt-8 pb-4 scrollbar-hide">
              <nav className="flex flex-col">
                {navigation.links.map((link) => (
                  <div key={link.name} className="px-6 border-b border-black/5 last:border-0 pb-6 mb-6">
                    {link.hasMegaMenu ? (
                      <div>
                        <button
                          onClick={() => setMobileShopOpen(!mobileShopOpen)}
                          className="w-full text-base font-bold heading-font uppercase tracking-[0.2em] flex items-center justify-between"
                        >
                          {link.name}
                          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileShopOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {mobileShopOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-8 flex gap-5 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x">
                                {categories.map((cat) => (
                                  <Link
                                    key={cat.name}
                                    href={`/shop?category=${cat.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex-shrink-0 w-[180px] group snap-start"
                                  >
                                    <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden mb-3 bg-black/5">
                                      <Image 
                                        src={cat.image} 
                                        alt={cat.name}
                                        fill
                                        sizes="180px"
                                        className="object-cover transition-transform group-active:scale-95"
                                        quality={60}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                                        <p className="text-white font-bold text-[10px] uppercase tracking-widest">{cat.name}</p>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-base font-bold heading-font uppercase tracking-[0.2em] block"
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-8 space-y-4 bg-white border-t border-black/5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full bg-black text-white flex items-center justify-center gap-4 py-6 rounded-3xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-black/20 active:scale-95 transition-transform"
              >
                <User className="w-5 h-5" />
                My Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
