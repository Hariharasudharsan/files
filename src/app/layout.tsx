import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import MobileBottomNav from "@/components/ui/MobileBottomNav";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
import WishlistHydration from "@/components/WishlistHydration";
import { getDefaultSEO, getOrganizationJsonLd, getWebSiteJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sridhasstore.com";

export const metadata: Metadata = {
  ...getDefaultSEO(),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"),
  alternates: { canonical: "/" },
};

const organizationJsonLd = getOrganizationJsonLd();
const webSiteJsonLd = getWebSiteJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${outfit.variable} flex min-h-screen flex-col bg-surface-50 font-sans text-surface-900 antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c') }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd).replace(/</g, '\\u003c') }}
        />
        <Navbar />
        <CartDrawer />
        <WishlistHydration />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppWidget />
        <MobileBottomNav />
      </body>
    </html>
  );
}
