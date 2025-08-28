import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static Export Configuration
  output: 'export',
  reactStrictMode: true,
  
  // Performance Optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image Optimization (unoptimized for static export)
  images: {
    unoptimized: true,
  },

  // Environment Variables (client-side only)
  env: {
    MONAY_APP_TYPE: 'website',
    MONAY_SERVICES: 'caas,waas',
    NEXT_PUBLIC_FORMSPREE_FORM_ID: process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || '',
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
    NEXT_PUBLIC_CALENDLY_URL: process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/monay-demo',
  },

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint Configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Redirect Configuration (handled client-side in static export)
  trailingSlash: true,
};

export default nextConfig;