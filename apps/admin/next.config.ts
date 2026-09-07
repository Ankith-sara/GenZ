import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: "10mb",
  },
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
  async rewrites() {
    return [
      {
        source: "/admin/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
