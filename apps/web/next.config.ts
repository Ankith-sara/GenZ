import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@genz/ui",
    "@genz/database",
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
