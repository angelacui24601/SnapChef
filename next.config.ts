import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All backend functionality now lives in Next.js API routes under /api/*.
  // No proxy rewrite needed — requests are handled by the same Next.js process
  // both locally and on Vercel.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
