
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * next/image needs remote hosts allow-listed before it will optimize
 * external images. The storefront owns its catalog, but product images may
 * still be hosted by an ERP/CDN, so hosts are controlled by environment.
 */
const externalImageHostname = (() => {
  const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST || process.env.ERP_BASE_URL;

  try {
    if (!imageHost) {
      if (process.env.NODE_ENV !== "production") {
        return "example.com";
      }
      throw new Error("Image host not set");
    }
    return new URL(imageHost).hostname;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      return "example.com";
    }
    throw new Error("NEXT_PUBLIC_IMAGE_HOST or ERP_BASE_URL must be a valid URL in production.");
  }
})();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: externalImageHostname },
      { protocol: "http", hostname: externalImageHostname },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' https://checkout.razorpay.com https://cdn.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com wss://ws.pusherapp.com; frame-src 'self' https://api.razorpay.com;",
          },
        ],
      },
    ]
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "mathuram-foods",
  project: "storefront",
  widenClientFileUpload: true,
});
