import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence Turbopack root warning by explicitly setting the project root
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
