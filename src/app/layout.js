import { Inter, Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/components/providers/AuthProvider";

import dbConnect from "@/lib/db";
import SiteConfig from "@/models/SiteConfig";
import { SiteProvider } from "@/context/SiteContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Pairo | Premium Shearling Jackets",
  description: "Experience the ultimate warmth and luxury with Pairo's handcrafted shearling jackets.",
};

import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default async function RootLayout({ children }) {
  let config = null;
  
  try {
    await dbConnect();
    config = await SiteConfig.findOne({ key: 'main' }).lean();
  } catch (error) {
    console.error("Layout Data Fetch Error:", error);
  }

  // Fallback if DB is down or config is missing
  const finalConfig = config || { 
    brand: { name: "Pairo", tagline: "Premium Shearling" },
    navigation: { links: [], offers: ["Welcome to Pairo Store"] },
    hero: { slides: [{ title: "Pairo", subtitle: "Handcrafted Luxury", image: "/placeholder.jpg", buttonText: "Shop Now" }], labels: { viewCollection: "View Collection" } },
    footer: { sections: [{}, { links: [] }], categories: { items: [] } },
    categories: { items: [] }
  };

  const sanitizedConfig = JSON.parse(JSON.stringify(finalConfig));

  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          <SiteProvider initialData={sanitizedConfig}>
            <CartProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </CartProvider>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
