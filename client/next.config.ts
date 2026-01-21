import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const basePath = isGithubActions && repoName ? `/${repoName}` : undefined;
const assetPrefix = basePath;

const nextConfig: NextConfig = {
  trailingSlash: false,
  output: "export",
  basePath,
  assetPrefix,
  images: { unoptimized: true },
};

export default nextConfig;
