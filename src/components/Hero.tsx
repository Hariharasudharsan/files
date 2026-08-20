"use client";
import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function DecorativeElement() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-tint/30 blur-3xl" />
      <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-mid/10 blur-3xl" />
    </div>
  );
}

export default function Hero({ banners }: { banners: { title: string, subtitle?: string | null, link: string | null, media: { url: string } | null }[] }) {
  const [currentBanner, setCurrentBanner] = useState(banners?.[0] || null);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => {
        const currentIndex = banners.findIndex(b => b.title === prev?.title);
        return banners[(currentIndex + 1) % banners.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Staggered animation variants
  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative bg-base text-brand-deep px-4 py-24 sm:py-32 lg:py-48 overflow-hidden transition-all duration-1000 ease-in-out">
      {currentBanner?.media?.url && (
        <div 
          className="absolute inset-0 z-0 opacity-20 mix-blend-multiply"
          style={{ backgroundImage: `url(${currentBanner.media.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}

      <DecorativeElement />
      
      <div className="relative z-20 mx-auto max-w-7xl flex flex-col items-center text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.span variants={item} className="text-accent-fry tracking-widest uppercase text-sm font-bold mb-6 block">
            Sun-dried • Traditionally Crafted
          </motion.span>
          
          <motion.h1 variants={item} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
            {currentBanner?.title || (
              <>
                Factory-Direct. <br />
                <span className="text-brand-mid">Golden-Brown Perfection.</span>
              </>
            )}
          </motion.h1>
          
          <motion.p variants={item} className="mx-auto max-w-2xl text-lg sm:text-xl text-brand-deep/80 mb-10 font-medium whitespace-pre-line">
            {currentBanner?.subtitle || "Premium papadams, vadams, and appalams straight from our drying yards. Raw, pale discs ready to puff into crisp, golden snacks in seconds."}
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#products">
              <Button size="lg" className="bg-accent-fry hover:opacity-90 text-white w-full sm:w-auto shadow-lg shadow-accent-fry/30 border-none">
                Shop the Harvest
              </Button>
            </Link>
            <Link href="/bundles">
              <Button size="lg" variant="outline" className="border-brand-mid text-brand-deep hover:bg-brand-tint w-full sm:w-auto bg-transparent">
                View Pantry Combos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
