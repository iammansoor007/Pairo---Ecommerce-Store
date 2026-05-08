import Link from "next/link";
import { Globe, MessageSquare, Camera, Code } from "lucide-react";
import siteData from "@/lib/data.json";

export default function Footer() {
  const { brand, footer } = siteData;

  return (
    <footer className="bg-[var(--secondary)] pt-40 pb-12 relative mt-20">
      {/* Newsletter Section - Overlapping */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl px-4">
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 shadow-xl rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="text-[var(--foreground)] text-3xl md:text-4xl font-black max-w-lg leading-tight">
            {footer.newsletterTitle}
          </h2>
          <div className="w-full md:w-auto flex flex-col gap-3 min-w-[300px]">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-[var(--secondary)] rounded-full py-3 px-12 text-sm focus:outline-none"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
            </div>
            <button className="bg-[var(--primary)] text-[var(--background)] font-bold rounded-full py-3 px-6 text-sm hover:opacity-80 transition-colors">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black uppercase tracking-tighter">
                {brand.name}
              </span>
            </Link>
            <p className="text-[var(--foreground)]/60 text-sm leading-relaxed mb-8 max-w-xs">
              {brand.description}
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="w-10 h-10 bg-[var(--background)] rounded-full flex items-center justify-center hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all border border-[var(--foreground)]/10 shadow-sm"
              >
                <Globe className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[var(--foreground)] text-[var(--background)] rounded-full flex items-center justify-center hover:opacity-80 transition-all border border-[var(--foreground)]/10 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[var(--background)] rounded-full flex items-center justify-center hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all border border-[var(--foreground)]/10 shadow-sm"
              >
                <Camera className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[var(--background)] rounded-full flex items-center justify-center hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all border border-[var(--foreground)]/10 shadow-sm"
              >
                <Code className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          {footer.sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold tracking-widest text-sm mb-6 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[var(--foreground)]/60 text-sm hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[var(--foreground)]/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--foreground)]/60 text-sm">
            {brand.name} © 2000-2023, All Rights Reserved
          </p>
          <div className="flex items-center space-x-4">
            {/* Payment Icons Placeholder */}
            <div className="h-8 w-12 bg-[var(--background)] rounded border border-[var(--foreground)]/10 flex items-center justify-center text-[10px] font-bold">VISA</div>
            <div className="h-8 w-12 bg-[var(--background)] rounded border border-[var(--foreground)]/10 flex items-center justify-center text-[10px] font-bold">MC</div>
            <div className="h-8 w-12 bg-[var(--background)] rounded border border-[var(--foreground)]/10 flex items-center justify-center text-[10px] font-bold">PAYPAL</div>
            <div className="h-8 w-12 bg-[var(--background)] rounded border border-[var(--foreground)]/10 flex items-center justify-center text-[10px] font-bold">APPLE</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
