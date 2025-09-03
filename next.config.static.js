/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export (Next.js 13+)
  output: 'export',
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Base path if your site is not at root (e.g., /subdirectory)
  // basePath: '',
  
  // Asset prefix for CDN (optional)
  // assetPrefix: 'https://cdn.monay.com',
  
  // Trailing slashes for better compatibility with static hosting
  trailingSlash: true,
  
  // Environment variables that will be inlined at build time
  env: {
    // API endpoint for your Vercel-hosted API
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://monay-api.vercel.app',
    
    // Vtiger configuration (for direct client-side calls as fallback)
    NEXT_PUBLIC_VTIGER_URL: process.env.NEXT_PUBLIC_VTIGER_URL,
    NEXT_PUBLIC_VTIGER_USERNAME: process.env.NEXT_PUBLIC_VTIGER_USERNAME,
    
    // reCAPTCHA
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
  
  // Disable server-side features
  experimental: {
    // Disable runtime JS for smaller bundle
    // runtime: 'nodejs',
  },
  
  // Custom webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client-side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;