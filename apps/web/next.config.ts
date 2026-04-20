import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "convex/server": "../../node_modules/convex/server.js",
      "convex/react": "../../node_modules/convex/dist/esm/react/index.js",
    },
  },
};

export default nextConfig;
