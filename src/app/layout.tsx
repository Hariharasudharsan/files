import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import MobileBottomNav from "@/components/ui/MobileBottomNav";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
import WishlistHydration from "@/components/WishlistHydration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mathuramfoods.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sridha's Store | Authentic Factory-Direct Papadam, Vadam & Appalam",
    template: "%s | Sridha's Store",
  },
  description:
    "Sridha's Store sells premium, authentic, factory-direct papadam, vadam, appalam and South Indian snacks — traditionally sun-dried, hygienically packed, shipped pan-India.",
  keywords: [
    "papad online",
    "appalam online",
    "vadam online",
    "buy papadam india",
    "south indian snacks online",
    "vathal online",
    "jeera vadam",
    "ompodi",
    "onion bakoda",
    "rice papad",
    "factory direct papad",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Sridha's Store",
    title: "Sridha's Store | Authentic Factory-Direct Papadam, Vadam & Appalam",
    description: "Premium, authentic, factory-direct Indian papadams, vadams and traditional snacks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sridha's Store | Authentic Factory-Direct Papadam, Vadam & Appalam",
    description: "Premium, authentic, factory-direct Indian papadams, vadams and traditional snacks.",
  },
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sridha's Store",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Factory-direct manufacturer of authentic papadam, vadam, appalam and South Indian snacks.",
  contactPoint: {
    "@type": "ContactPoint",
    "telephone": "+91-7708838059",
    "contactType": "Customer Service"
  },
  sameAs: [
    "https://facebook.com/mathuramfoods",
    "https://instagram.com/mathuramfoods"
  ]
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    "target": `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
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
