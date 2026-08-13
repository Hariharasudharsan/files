"use client";

import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function WhatsAppWidget() {
  // TODO: Replace NEXT_PUBLIC_WHATSAPP_NUMBER in .env with the real number once available
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 3 seconds of scrolling
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        >
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-surface-200 text-sm font-medium text-surface-900 max-w-[200px] text-center animate-pulse-slow">
            Need help with your order? Chat with us!
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl hover:bg-green-600 hover:scale-110 transition-all duration-300"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="h-7 w-7" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
