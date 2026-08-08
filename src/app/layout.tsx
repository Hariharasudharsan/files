import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
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
    default: "Mathuram Foods | Authentic Factory-Direct Papadam, Vadam & Appalam",
    template: "%s | Mathuram Foods",
  },
  description:
    "Mathuram Foods sells premium, authentic, factory-direct papadam, vadam, appalam and South Indian snacks — traditionally sun-dried, hygienically packed, shipped pan-India.",
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
    siteName: "Mathuram Foods",
    title: "Mathuram Foods | Authentic Factory-Direct Papadam, Vadam & Appalam",
    description: "Premium, authentic, factory-direct Indian papadams, vadams and traditional snacks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mathuram Foods | Authentic Factory-Direct Papadam, Vadam & Appalam",
    description: "Premium, authentic, factory-direct Indian papadams, vadams and traditional snacks.",
  },
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mathuram Foods",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Factory-direct manufacturer of authentic papadam, vadam, appalam and South Indian snacks.",
  contactPoint: {
    "@type": "ContactPoint",
    "telephone": "+91-9876543210",
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
    <html lang="en" className="scroll-smooth">
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
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
