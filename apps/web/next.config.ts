import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(process.cwd(), "../../"),
    resolveAlias: {
      "convex/server": path.resolve(process.cwd(), "../../node_modules/convex/server.js"),
      "convex/react": path.resolve(process.cwd(), "../../node_modules/convex/dist/esm/react/index.js"),
    },
  },
};

export default nextConfig;
