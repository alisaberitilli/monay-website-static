import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@shared'],
  typedRoutes: true,
};

export default nextConfig;