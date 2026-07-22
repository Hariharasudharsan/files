import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-fraunces",
});

// TODO: replace with your production domain before deploying.
const SITE_URL = "https://www.mathuramfoods.com";

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
  description:
    "Factory-direct manufacturer of authentic papadam, vadam, appalam and South Indian snacks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} scroll-smooth`}>
      <body className="flex min-h-screen flex-col bg-orange-50 font-sans text-orange-950 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Navbar />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
