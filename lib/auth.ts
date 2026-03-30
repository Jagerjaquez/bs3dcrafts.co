/**
 * Authentication & Authorization Utilities
 * 
 * Provides middleware and utilities for protecting admin routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, ErrorCode, ERROR_MESSAGES } from './error-handler'

/**
 * Verify admin authentication
 * 
 * Checks for admin secret in Authorization header
 * Format: "Bearer <ADMIN_SECRET>"
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return false
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.replace('Bearer ', '').trim()
  
  // Compare with admin secret from environment
  const adminSecret = process.env.ADMIN_SECRET
  
  if (!adminSecret) {
    console.error('ADMIN_SECRET not configured in environment variables')
    return false
  }

  return token === adminSecret
}

/**
 * Middleware to protect admin routes
 * 
 * Returns 401 Unauthorized if authentication fails
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
  if (!verifyAdminAuth(request)) {
    const errorResponse = createErrorResponse(
      'Yetkisiz erişim. Admin girişi gerekli.',
      ErrorCode.UNAUTHORIZED
    )
    return NextResponse.json(errorResponse, { status: 401 })
  }
  
  return null // Authentication successful
}

/**
 * Extract and validate API key from request
 * 
 * For future use with API key authentication
 */
export function extractApiKey(request: NextRequest): string | null {
  // Check header
  const headerKey = request.headers.get('x-api-key')
  if (headerKey) {
    return headerKey
  }

  // Check query parameter
  const url = new URL(request.url)
  const queryKey = url.searchParams.get('api_key')
  if (queryKey) {
    return queryKey
  }

  return null
}

/**
 * Verify API key (for future implementation)
 */
export function verifyApiKey(apiKey: string): boolean {
  // TODO: Implement API key verification
  // For now, return false
  return false
}

/**
 * Rate limit check for authentication attempts
 * 
 * Prevents brute force attacks on admin login
 */
const authAttempts = new Map<string, { count: number; resetTime: number }>()

export function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now()
  const maxAttempts = 5
  const windowMs = 15 * 60 * 1000 // 15 minutes

  let entry = authAttempts.get(ip)

  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    authAttempts.set(ip, entry)
    return true
  }

  entry.count++

  if (entry.count > maxAttempts) {
    return false
  }

  return true
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return '127.0.0.1'
}
