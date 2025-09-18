import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Development-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    // Disable React Strict Mode in development to prevent double rendering
    // which can sometimes cause auth issues
    reactStrictMode: false,
    // Disable static optimization to prevent caching issues
    output: 'standalone',
  }),
  
  // External packages that should be processed by the server
  serverExternalPackages: ["@prisma/client", "@clerk/nextjs"],
  
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
