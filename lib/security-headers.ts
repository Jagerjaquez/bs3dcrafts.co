/**
 * Security headers utility for API routes
 * Provides additional security headers for API endpoints
 */

import { NextResponse } from 'next/server'

export interface SecurityHeadersOptions {
  includeCSP?: boolean
  allowFraming?: boolean
  customHeaders?: Record<string, string>
}

/**
 * Apply security headers to API responses
 */
export function withSecurityHeaders(
  response: NextResponse,
  options: SecurityHeadersOptions = {}
): NextResponse {
  const {
    includeCSP = false,
    allowFraming = false,
    customHeaders = {}
  } = options

  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Frame options
  if (!allowFraming) {
    response.headers.set('X-Frame-Options', 'DENY')
  }

  // HTTPS enforcement in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // Content Security Policy for API responses (if needed)
  if (includeCSP) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none';"
    )
  }

  // Custom headers
  Object.entries(customHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Create a secure JSON response with security headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  options: SecurityHeadersOptions = {}
): NextResponse {
  const response = NextResponse.json(data, { status })
  return withSecurityHeaders(response, options)
}

/**
 * Create a secure error response
 */
export function createSecureErrorResponse(
  message: string,
  status: number = 400,
  options: SecurityHeadersOptions = {}
): NextResponse {
  const response = NextResponse.json({ error: message }, { status })
  return withSecurityHeaders(response, {
    ...options,
    includeCSP: true // Always include CSP for error responses
  })
}

/**
 * Security headers for admin API routes
 */
export function withAdminSecurityHeaders(response: NextResponse): NextResponse {
  return withSecurityHeaders(response, {
    includeCSP: true,
    allowFraming: false,
    customHeaders: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

/**
 * Security headers for public API routes
 */
export function withPublicSecurityHeaders(response: NextResponse): NextResponse {
  return withSecurityHeaders(response, {
    includeCSP: false,
    allowFraming: false,
    customHeaders: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}