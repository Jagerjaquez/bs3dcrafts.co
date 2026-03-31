import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jiutbqwwjkzjwzhxmgnw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Security Headers for Production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
};

// Sentry configuration
const sentryConfig = {
  // Sentry auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only upload source maps in production
  silent: true,
  
  // Disable source map upload if no auth token
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
  
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  
  // Hide source maps from generated client bundles
  hideSourceMaps: true,
  
  // Transpile SDK to be compatible with IE11
  transpileClientSDK: true,
  
  // Route browser requests to Sentry through a Next.js rewrite
  tunnelRoute: '/monitoring',
  
  // Automatically instrument Next.js data fetching methods
  autoInstrumentServerFunctions: true,
  
  // Automatically instrument Next.js API routes
  autoInstrumentMiddleware: true,
}

// Export with Sentry if DSN is configured
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
