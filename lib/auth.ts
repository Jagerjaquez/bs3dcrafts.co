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

/**
 * Session Management
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AdminSession {
  id: string
  adminId: string
  createdAt: Date
  expiresAt: Date
  ipAddress: string
  userAgent: string
  lastUsed: Date
}

/**
 * Create admin session
 * 
 * Creates a new session with 24-hour expiration
 * Tracks IP address and user agent for security
 */
export async function createAdminSession(
  adminId: string,
  request: NextRequest
): Promise<string> {
  const sessionId = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
  
  const ipAddress = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  await prisma.adminSession.create({
    data: {
      id: sessionId,
      adminId,
      createdAt: now,
      expiresAt,
      ipAddress,
      userAgent,
      lastUsed: now
    }
  })
  
  return sessionId
}

/**
 * Verify admin session
 * 
 * Checks if session exists and is not expired
 * Updates lastUsed timestamp on successful verification
 */
export async function verifyAdminSession(
  sessionId: string
): Promise<AdminSession | null> {
  if (!sessionId) {
    return null
  }
  
  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId }
  })
  
  if (!session) {
    return null
  }
  
  // Check if session is expired
  if (new Date() > session.expiresAt) {
    // Delete expired session
    await prisma.adminSession.delete({
      where: { id: sessionId }
    })
    return null
  }
  
  // Update lastUsed timestamp
  await prisma.adminSession.update({
    where: { id: sessionId },
    data: { lastUsed: new Date() }
  })
  
  return session
}

/**
 * Delete admin session (logout)
 */
export async function deleteAdminSession(sessionId: string): Promise<void> {
  await prisma.adminSession.delete({
    where: { id: sessionId }
  }).catch(() => {
    // Ignore errors if session doesn't exist
  })
}

/**
 * Clean up expired sessions
 * 
 * Should be called periodically to remove old sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}
