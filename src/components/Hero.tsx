"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function DecorativeElement() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-800/20 blur-3xl" />
      <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-3xl" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative bg-surface-950 text-primary-50 px-4 py-24 sm:py-32 lg:py-48 overflow-hidden">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-surface-950/80 mix-blend-multiply z-10" />
        {/* Placeholder for actual hero image, currently a solid gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950 to-surface-950" />
      </div>

      <DecorativeElement />
      <div className="relative z-20 mx-auto max-w-7xl flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <span className="text-accent-500 tracking-widest uppercase text-sm font-bold mb-6 block drop-shadow-md">
            100% Natural • No Preservatives
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight drop-shadow-xl">
            The Authentic Taste of <br />
            <span className="text-primary-400">South Indian Tradition.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-primary-100/90 mb-10 font-medium drop-shadow-md">
            Premium factory-direct Appalams, Vadams, and Pickles. Sun-dried, hygienically packed, and delivered straight to your kitchen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#products">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white w-full sm:w-auto shadow-xl shadow-primary-900/50">
                Explore Collection
              </Button>
            </Link>
            <Link href="/category/combo-packs">
              <Button size="lg" variant="outline" className="border-primary-400 text-primary-300 hover:bg-primary-900 w-full sm:w-auto backdrop-blur-sm">
                View Combo Offers <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
