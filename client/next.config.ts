import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Ensure proper routing on Netlify
  trailingSlash: false,
};

export default nextConfig;
