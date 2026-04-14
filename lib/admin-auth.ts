/**
 * Enhanced Admin Authentication
 * 
 * Provides secure admin authentication with:
 * - Session management with expiration
 * - CSRF protection
 * - Audit logging
 * - Rate limiting for brute force protection
 */

import { cookies, headers } from 'next/headers'
import { createSession, validateSession, destroySession } from './session'
import { logAudit, getFailedLoginAttempts } from './audit-log'
import { checkRateLimit, RateLimitPresets } from './rate-limit'
import { verifyPassword } from './password-hash'
import crypto from 'crypto'

const ADMIN_SECRET = process.env.ADMIN_SECRET
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

/**
 * Get client IP address from request
 */
function getClientIP(request?: Request): string {
  if (!request) return 'unknown'
  
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Get user agent from request
 */
function getUserAgent(request?: Request): string {
  if (!request) return 'unknown'
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const session = await validateSession()
    return session !== null
  } catch (error) {
    console.error('Admin auth check error:', error)
    return false
  }
}

/**
 * Authenticate admin with password
 */
export async function authenticateAdmin(
  password: string,
  request?: Request
): Promise<{ success: boolean; error?: string }> {
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)
  
  // Check rate limit using new rate-limit utility
  const rateLimitResult = checkRateLimit(ipAddress, RateLimitPresets.AUTH)
  
  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60)
    
    await logAudit({
      action: 'admin_login_failed',
      userId: 'unknown',
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Rate limit exceeded',
      details: { remaining: rateLimitResult.remaining },
    })
    
    return {
      success: false,
      error: `Çok fazla başarısız deneme. ${retryAfter} dakika sonra tekrar deneyin.`,
    }
  }
  
  // Validate admin password
  let isValid = false
  
  // Check if we have a hashed password (new method)
  if (ADMIN_PASSWORD_HASH) {
    isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH)
  } 
  // Fallback to plain text comparison (legacy method)
  else if (ADMIN_SECRET) {
    console.warn('Using legacy plain text password. Please migrate to hashed password.')
    // Constant-time comparison to prevent timing attacks
    isValid = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(ADMIN_SECRET)
    )
  } else {
    console.error('No admin password configured (ADMIN_PASSWORD_HASH or ADMIN_SECRET)')
    return {
      success: false,
      error: 'Sunucu yapılandırma hatası',
    }
  }
  
  if (!isValid) {
    await logAudit({
      action: 'admin_login_failed',
      userId: 'unknown',
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Invalid password',
      details: { remaining: rateLimitResult.remaining },
    })
    
    return {
      success: false,
      error: 'Geçersiz şifre',
    }
  }
  
  // Create session
  await createSession('admin', ipAddress, userAgent)
  
  // Log successful login
  await logAudit({
    action: 'admin_login',
    userId: 'admin',
    ipAddress,
    userAgent,
    success: true,
  })
  
  return { success: true }
}

/**
 * Logout admin
 */
export async function logoutAdmin(request?: Request): Promise<void> {
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)
  
  await destroySession()
  
  await logAudit({
    action: 'admin_logout',
    userId: 'admin',
    ipAddress,
    userAgent,
    success: true,
  })
}

/**
 * Middleware to require admin authentication
 */
export async function requireAdminAuth(
  request: Request
): Promise<Response | null> {
  const isAuth = await isAdminAuthenticated()
  
  if (!isAuth) {
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)
    
    await logAudit({
      action: 'admin_login_failed',
      userId: 'unknown',
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Unauthorized access attempt',
      details: { path: new URL(request.url).pathname },
    })
    
    return new Response(
      JSON.stringify({
        error: 'Yetkisiz erişim. Admin girişi gerekli.',
        code: 'UNAUTHORIZED',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  
  return null
}

/**
 * Legacy function for backward compatibility
 */
export async function setAdminSession(): Promise<void> {
  await createSession('admin')
}

/**
 * Legacy function for backward compatibility
 */
export async function clearAdminSession(): Promise<void> {
  await destroySession()
}
