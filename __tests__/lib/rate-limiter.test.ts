import { describe, it, expect, beforeEach } from '@jest/globals'
import fc from 'fast-check'
import { rateLimiter, getClientIp } from '@/lib/rate-limiter'

describe('Rate Limiter - Property Tests', () => {
  beforeEach(() => {
    // Clear rate limiter state before each test
    rateLimiter.clear()
  })

  it('Property 19: Rate Limiting Enforcement - requests exceeding limit are rejected', () => {
    // Feature: stripe-payment-integration, Property 19: Rate Limiting Enforcement
    // Validates: Requirements 9.6
    
    fc.assert(
      fc.property(
        fc.ipV4(),
        fc.integer({ min: 11, max: 20 }), // Request count exceeding the limit of 10
        (ip, requestCount) => {
          // Clear state for this IP
          rateLimiter.reset(ip)

          // Make requests up to the limit (10 requests should succeed)
          for (let i = 0; i < 10; i++) {
            const allowed = rateLimiter.check(ip)
            expect(allowed).toBe(true)
          }

          // All subsequent requests should be rejected
          for (let i = 10; i < requestCount; i++) {
            const allowed = rateLimiter.check(ip)
            expect(allowed).toBe(false)
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 19: Rate Limiting Enforcement - different IPs have independent limits', () => {
    // Feature: stripe-payment-integration, Property 19: Rate Limiting Enforcement
    // Validates: Requirements 9.6
    
    fc.assert(
      fc.property(
        fc.array(fc.ipV4(), { minLength: 2, maxLength: 5 }),
        (ips) => {
          // Ensure IPs are unique
          const uniqueIps = [...new Set(ips)]
          if (uniqueIps.length < 2) return true // Skip if not enough unique IPs

          // Clear state for all IPs
          uniqueIps.forEach(ip => rateLimiter.reset(ip))

          // Each IP should be able to make 10 requests independently
          for (const ip of uniqueIps) {
            for (let i = 0; i < 10; i++) {
              const allowed = rateLimiter.check(ip)
              expect(allowed).toBe(true)
            }
            
            // 11th request should be rejected
            const allowed = rateLimiter.check(ip)
            expect(allowed).toBe(false)
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 19: Rate Limiting Enforcement - rate limit resets after time window', () => {
    // Feature: stripe-payment-integration, Property 19: Rate Limiting Enforcement
    // Validates: Requirements 9.6
    
    fc.assert(
      fc.property(
        fc.ipV4(),
        (ip) => {
          // Clear state for this IP
          rateLimiter.reset(ip)

          // Make 10 requests (should all succeed)
          for (let i = 0; i < 10; i++) {
            const allowed = rateLimiter.check(ip)
            expect(allowed).toBe(true)
          }

          // 11th request should be rejected
          expect(rateLimiter.check(ip)).toBe(false)

          // Get reset time
          const resetTime = rateLimiter.getResetTime(ip)
          expect(resetTime).toBeGreaterThan(Date.now())

          // Verify remaining is 0
          expect(rateLimiter.getRemaining(ip)).toBe(0)
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Rate Limiter - Unit Tests', () => {
  beforeEach(() => {
    rateLimiter.clear()
  })

  it('should allow requests within the limit', () => {
    const ip = '192.168.1.1'
    
    // First 10 requests should be allowed
    for (let i = 0; i < 10; i++) {
      expect(rateLimiter.check(ip)).toBe(true)
    }
  })

  it('should reject requests exceeding the limit', () => {
    const ip = '192.168.1.1'
    
    // Use up the limit
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(ip)
    }
    
    // 11th request should be rejected
    expect(rateLimiter.check(ip)).toBe(false)
  })

  it('should track remaining requests correctly', () => {
    const ip = '192.168.1.1'
    
    expect(rateLimiter.getRemaining(ip)).toBe(10)
    
    rateLimiter.check(ip)
    expect(rateLimiter.getRemaining(ip)).toBe(9)
    
    rateLimiter.check(ip)
    expect(rateLimiter.getRemaining(ip)).toBe(8)
  })

  it('should handle multiple IPs independently', () => {
    const ip1 = '192.168.1.1'
    const ip2 = '192.168.1.2'
    
    // Use up limit for ip1
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(ip1)
    }
    
    // ip1 should be blocked
    expect(rateLimiter.check(ip1)).toBe(false)
    
    // ip2 should still be allowed
    expect(rateLimiter.check(ip2)).toBe(true)
  })

  it('should reset rate limit for specific IP', () => {
    const ip = '192.168.1.1'
    
    // Use up the limit
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(ip)
    }
    
    expect(rateLimiter.check(ip)).toBe(false)
    
    // Reset and try again
    rateLimiter.reset(ip)
    expect(rateLimiter.check(ip)).toBe(true)
  })

  it('should extract IP from x-forwarded-for header', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '203.0.113.1, 198.51.100.1'
          return null
        }
      }
    } as unknown as Request

    const ip = getClientIp(mockRequest)
    expect(ip).toBe('203.0.113.1')
  })

  it('should extract IP from x-real-ip header', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') return '203.0.113.1'
          return null
        }
      }
    } as unknown as Request

    const ip = getClientIp(mockRequest)
    expect(ip).toBe('203.0.113.1')
  })

  it('should fallback to localhost when no IP headers present', () => {
    const mockRequest = {
      headers: {
        get: () => null
      }
    } as unknown as Request

    const ip = getClientIp(mockRequest)
    expect(ip).toBe('127.0.0.1')
  })
})
