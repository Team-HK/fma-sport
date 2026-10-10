import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  async redirects() {
    // One canonical host for search engines: send the Vercel URL to www.fmasport.com.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "fma-sport.vercel.app" }],
        destination: "https://www.fmasport.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
