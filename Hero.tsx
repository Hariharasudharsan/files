"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

/**
 * Decorative concentric-ring motif behind the headline — a quiet nod to the
 * actual shape of a papadam/vadam disc (and the sun-drying process behind
 * it), rather than a generic gradient blob. Pure SVG, no external image.
 */
function DiscMotif() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <svg width="820" height="820" viewBox="0 0 820 820" className="text-orange-900/[0.06]">
        <circle cx="410" cy="410" r="380" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="410" cy="410" r="300" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="410" cy="410" r="220" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="410" cy="410" r="140" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-100 via-orange-50 to-orange-50 px-4 py-20 text-center sm:py-28">
      <DiscMotif />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-3xl"
      >
        <h1 className="font-display text-4xl font-bold tracking-tight text-orange-950 sm:text-5xl md:text-6xl">
          Authentic Heritage, Crisp in Every Bite.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-orange-800/80">
          Factory-direct, sun-dried papadams, vadams &amp; appalams — made the traditional way and
          shipped straight from our unit to your kitchen.
        </p>
        <a
          href="#products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/20 transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
        >
          Shop the Range <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </a>
      </motion.div>
    </section>
  );
}
