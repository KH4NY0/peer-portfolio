import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {},
    serverComponentsExternalPackages: [],
  },
  transpilePackages: ['@clerk/nextjs'],
  // Development-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    // Disable React Strict Mode in development to prevent double rendering
    // which can sometimes cause auth issues
    reactStrictMode: false,
    // Disable static optimization to prevent caching issues
    output: 'standalone',
  }),
  
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
