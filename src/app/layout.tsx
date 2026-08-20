import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import { prisma } from "@/lib/infrastructure/database/prisma";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"));
import WishlistHydration from "@/components/WishlistHydration";
import { getDefaultSEO, getOrganizationJsonLd, getWebSiteJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sridhasstore.com";

export const metadata: Metadata = {
  ...getDefaultSEO(),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"),
  alternates: { canonical: "/" },
};

const organizationJsonLd = getOrganizationJsonLd();
const webSiteJsonLd = getWebSiteJsonLd();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeConfig: any = {};
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "THEME_CONFIG" },
    });
    if (setting?.value) {
      themeConfig = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    }
  } catch (e) {
    // ignore
  }

  const customStyles = {
    "--theme-brand-deep": themeConfig.brandDeep || "#3368A0",
    "--theme-brand-mid": themeConfig.brandMid || "#66A3BF",
    "--theme-brand-tint": themeConfig.brandTint || "#C8DFDB",
    "--theme-base": themeConfig.baseBg || "#F2EFE7",
    "--theme-accent-fry": themeConfig.accentFry || "#C97A2B",
    "--theme-font-display": themeConfig.fontFamily || "var(--font-fraunces)",
    "--theme-radius": themeConfig.borderRadius || "0.5rem",
  } as React.CSSProperties;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  return (
    <html lang={locale} className="scroll-smooth" data-scroll-behavior="smooth">
      <body style={customStyles} className={`${inter.variable} ${fraunces.variable} flex min-h-screen flex-col bg-base font-sans text-brand-deep antialiased`}>
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
