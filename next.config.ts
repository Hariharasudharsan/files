import type { NextConfig } from "next";

/**
 * next/image needs remote hosts allow-listed before it will optimize
 * external images. The storefront owns its catalog, but product images may
 * still be hosted by an ERP/CDN, so hosts are controlled by environment.
 */
const externalImageHostname = (() => {
  const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST || process.env.ERP_BASE_URL;

  try {
    return imageHost ? new URL(imageHost).hostname : "**";
  } catch {
    return "**";
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
};

export default nextConfig;
