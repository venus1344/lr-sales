import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Emit .next/standalone so the Docker image only carries the traced runtime.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
