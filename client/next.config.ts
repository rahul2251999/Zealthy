import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  // Netlify plugin handles the build
  images: { unoptimized: true },
};

export default nextConfig;
