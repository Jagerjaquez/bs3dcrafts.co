import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler for better performance
  experimental: {
    reactCompiler: true,
  },
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jiutbqwwjkzjwzhxmgnw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Add formats for better performance
    formats: ['image/webp', 'image/avif'],
  },
  
  // Disable telemetry for better performance
  telemetry: {
    disabled: true,
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Security Headers (simplified for deployment)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ]
      }
    ]
  },
  
  // Rewrites for Sentry tunnel (if needed)
  async rewrites() {
    return [
      {
        source: '/monitoring/:path*',
        destination: 'https://o4507896268513280.ingest.us.sentry.io/:path*',
      },
    ]
  },
};

export default nextConfig;
