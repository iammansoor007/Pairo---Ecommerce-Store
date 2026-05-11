import { Inter, Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/layout/CartDrawer";
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

export default async function RootLayout({ children }) {
  await dbConnect();
  const config = await SiteConfig.findOne({ key: 'main' }).lean();
  const sanitizedConfig = JSON.parse(JSON.stringify(config));

  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          <SiteProvider initialData={sanitizedConfig}>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
