import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: { unoptimized: true },
  // Enable standalone output for Docker/Railway
  output: "standalone",
};

export default nextConfig;
