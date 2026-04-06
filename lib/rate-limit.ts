/**
 * Rate Limiting Utility
 * 
 * Provides configurable rate limiting for API endpoints
 * Prevents abuse and brute force attacks
 */

export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests allowed in window
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Authentication endpoints - strict limit to prevent brute force
  AUTH: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,             // 5 attempts
  },
  
  // Admin API endpoints - moderate limit
  ADMIN: {
    windowMs: 60 * 1000,        // 1 minute
    maxRequests: 200,           // 200 requests
  },
  
  // Public API endpoints - relaxed limit
  PUBLIC: {
    windowMs: 60 * 1000,        // 1 minute
    maxRequests: 100,           // 100 requests
  },
  
  // Media upload endpoints - very strict
  UPLOAD: {
    windowMs: 60 * 1000,        // 1 minute
    maxRequests: 10,            // 10 uploads
  },
} as const

/**
 * Check rate limit for identifier
 * 
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and remaining count
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = `${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  // Create new entry if doesn't exist or window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  // Increment count
  entry.count++
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit middleware for API routes
 * 
 * @param request - Request object
 * @param config - Rate limit configuration
 * @returns Response if rate limit exceeded, null otherwise
 */
export async function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const identifier = getClientIdentifier(request)
  const result = checkRateLimit(identifier, config)
  
  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    )
  }
  
  return null
}

/**
 * Get client identifier from request
 * 
 * Uses IP address as identifier
 */
function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to unknown (should not happen in production)
  return 'unknown'
}

/**
 * Reset rate limit for identifier
 * 
 * Useful for testing or manual intervention
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Clear expired rate limit entries
 * 
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now()
  let cleaned = 0
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
      cleaned++
    }
  }
  
  return cleaned
}

/**
 * Get rate limit status for identifier
 * 
 * Useful for monitoring and debugging
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  return rateLimitStore.get(identifier) || null
}

/**
 * Combined middleware for admin endpoints
 * 
 * Applies rate limiting with admin preset
 */
export async function adminRateLimit(request: Request): Promise<Response | null> {
  return rateLimitMiddleware(request, RateLimitPresets.ADMIN)
}

/**
 * Combined middleware for public endpoints
 * 
 * Applies rate limiting with public preset
 */
export async function publicRateLimit(request: Request): Promise<Response | null> {
  return rateLimitMiddleware(request, RateLimitPresets.PUBLIC)
}

/**
 * Combined middleware for authentication endpoints
 * 
 * Applies strict rate limiting to prevent brute force
 */
export async function authRateLimit(request: Request): Promise<Response | null> {
  return rateLimitMiddleware(request, RateLimitPresets.AUTH)
}

/**
 * Combined middleware for upload endpoints
 * 
 * Applies strict rate limiting for uploads
 */
export async function uploadRateLimit(request: Request): Promise<Response | null> {
  return rateLimitMiddleware(request, RateLimitPresets.UPLOAD)
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupExpiredEntries()
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired rate limit entries`)
    }
  }, 5 * 60 * 1000)
}
