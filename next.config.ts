import type { NextConfig } from "next";

/**
 * next/image needs remote hosts allow-listed before it will optimize
 * external images. ERPNext's URL isn't known until deploy time (it's an
 * env var), so we parse it here at build time and scope image loading to
 * just that host. Falls back to a wildcard only if the env var is missing,
 * so `next dev` doesn't hard-fail before it's configured.
 */
const erpHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_ERPNEXT_URL
      ? new URL(process.env.NEXT_PUBLIC_ERPNEXT_URL).hostname
      : "**";
  } catch {
    return "**";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: erpHostname },
      { protocol: "http", hostname: erpHostname },
    ],
  },
};

export default nextConfig;
