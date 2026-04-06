/**
 * CSRF Protection
 * 
 * Provides Cross-Site Request Forgery protection for state-changing operations
 */

import { cookies, headers } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('base64url')
}

/**
 * Set CSRF token in cookie
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  return token
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get(CSRF_TOKEN_NAME)
  return csrfCookie?.value
}

/**
 * Verify CSRF token from request header
 */
export async function verifyCSRFToken(request: Request): Promise<boolean> {
  try {
    // Get token from cookie
    const cookieToken = await getCSRFToken()
    
    if (!cookieToken) {
      return false
    }
    
    // Get token from header
    const headersList = await headers()
    const headerToken = headersList.get(CSRF_HEADER_NAME)
    
    if (!headerToken) {
      return false
    }
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
  } catch (error) {
    console.error('CSRF verification error:', error)
    return false
  }
}

/**
 * Middleware to require CSRF token for state-changing operations
 * 
 * Use this middleware for all admin POST/PUT/DELETE endpoints
 */
export async function requireCSRFToken(request: Request): Promise<Response | null> {
  // Only check CSRF for state-changing methods
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null
  }
  
  const isValid = await verifyCSRFToken(request)
  
  if (!isValid) {
    return new Response(
      JSON.stringify({
        error: 'Invalid or missing CSRF token',
        code: 'CSRF_TOKEN_INVALID',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  
  return null
}

/**
 * Combined middleware for admin routes
 * 
 * Checks both authentication and CSRF protection
 * Use this for all admin API endpoints that modify data
 */
export async function requireAdminWithCSRF(request: Request): Promise<Response | null> {
  // Import here to avoid circular dependency
  const { requireAdminAuth } = await import('./admin-auth')
  
  // Check authentication first
  const authError = await requireAdminAuth(request)
  if (authError) {
    return authError
  }
  
  // Then check CSRF for state-changing operations
  const csrfError = await requireCSRFToken(request)
  if (csrfError) {
    return csrfError
  }
  
  return null
}

/**
 * Clear CSRF token
 */
export async function clearCSRFToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_TOKEN_NAME)
}
