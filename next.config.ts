import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  reactStrictMode: true,
  // Pin Next's workspace root to this package so the sibling Aethergrid
  // lockfile at the repo root doesn't confuse file-tracing.
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default config;
