/**
 * Rate Limiter for API endpoints
 * 
 * Implements IP-based rate limiting to prevent abuse.
 * Uses in-memory store for MVP (consider Redis for production).
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute

/**
 * Extract IP address from request
 */
export function getClientIp(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to localhost
  return '127.0.0.1'
}

/**
 * Rate limiter object with methods for checking and managing rate limits
 */
export const rateLimiter = {
  /**
   * Check if IP has exceeded rate limit
   * @param ip - The IP address to check
   * @returns true if request should be allowed, false if rate limited
   */
  check(ip: string): boolean {
    const now = Date.now()
    let entry = rateLimitStore.get(ip)

    // If no entry or reset time has passed, create new entry
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS,
      }
      rateLimitStore.set(ip, entry)
      return true
    }

    // Increment count
    entry.count++

    // Check if limit exceeded
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      return false
    }

    return true
  },

  /**
   * Get remaining requests for an IP
   * @param ip - The IP address
   * @returns Number of remaining requests
   */
  getRemaining(ip: string): number {
    const entry = rateLimitStore.get(ip)
    if (!entry) {
      return RATE_LIMIT_MAX_REQUESTS
    }

    const now = Date.now()
    if (now > entry.resetTime) {
      return RATE_LIMIT_MAX_REQUESTS
    }

    return Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count)
  },

  /**
   * Get reset time for an IP
   * @param ip - The IP address
   * @returns Timestamp when rate limit resets
   */
  getResetTime(ip: string): number {
    const entry = rateLimitStore.get(ip)
    if (!entry) {
      return Date.now() + RATE_LIMIT_WINDOW_MS
    }
    return entry.resetTime
  },

  /**
   * Reset rate limit for a specific IP
   * @param ip - The IP address to reset
   */
  reset(ip: string): void {
    rateLimitStore.delete(ip)
  },

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    rateLimitStore.clear()
  },

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [ip, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(ip)
      }
    }
  }
}

/**
 * Check if request should be rate limited
 * 
 * @param request - The incoming request
 * @returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(request: Request): boolean {
  const ip = getClientIp(request)
  return rateLimiter.check(ip)
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000)
}
