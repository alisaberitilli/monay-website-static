import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@shared'],
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;