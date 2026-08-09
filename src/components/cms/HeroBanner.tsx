import React from "react";
import Link from "next/link";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: "left" | "center" | "right";
}

export function HeroBanner({
  title,
  subtitle,
  backgroundImageUrl,
  ctaText,
  ctaLink,
  alignment = "center",
}: HeroBannerProps) {
  return (
    <div
      className={`relative w-full h-[600px] flex items-center bg-gray-900 overflow-hidden ${
        alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center"
      }`}
    >
      {backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}
      <div className={`relative z-10 px-8 max-w-4xl ${alignment === "center" ? "text-center" : "text-left"}`}>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        {subtitle && <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">{subtitle}</p>}
        {ctaText && ctaLink && (
          <Link
            href={ctaLink}
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-full transition-colors duration-200"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  );
}
