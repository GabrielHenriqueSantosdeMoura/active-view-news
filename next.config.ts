import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "theeconomiccollapseblog.com",
      },
      {
        protocol: "https",
        hostname: "theeconomiccollapseblog.com",
      }
    ],
  },
};

export default nextConfig;
