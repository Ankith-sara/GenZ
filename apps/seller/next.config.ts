import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow large form submissions (images uploaded via FormData)
      bodySizeLimit: "10mb",
    },
  },
  transpilePackages: [
    "@genz/ui",
    "@genz/database",
    "@genz/services",
    "@genz/utils",
    "@genz/validation",
    "@genz/types",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
