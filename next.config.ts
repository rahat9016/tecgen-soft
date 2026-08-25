import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.0.202",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
  allowedDevOrigins: ["localhost"],
};

export default nextConfig;
