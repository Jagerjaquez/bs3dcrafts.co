/**
 * Enhanced Session Management
 * 
 * Provides secure session handling with expiration, refresh, and audit logging
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_EXPIRY_HOURS = 8 // Session expires after 8 hours
const REFRESH_THRESHOLD_HOURS = 1 // Refresh if less than 1 hour remaining

export interface SessionData {
  token: string
  createdAt: number
  expiresAt: number
  lastActivity: number
  userId: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<SessionData> {
  const now = Date.now()
  const expiresAt = now + SESSION_EXPIRY_HOURS * 60 * 60 * 1000
  
  const session: SessionData = {
    token: generateSessionToken(),
    createdAt: now,
    expiresAt,
    lastActivity: now,
    userId,
    ipAddress,
    userAgent,
  }
  
  // Store session in cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    path: '/',
  })
  
  // Log session creation
  console.log('Session created:', {
    userId,
    expiresAt: new Date(expiresAt).toISOString(),
    ipAddress,
  })
  
  return session
}

/**
 * Get current session
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie) {
      return null
    }
    
    const session: SessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      await destroySession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(): Promise<void> {
  const session = await getSession()
  
  if (!session) {
    return
  }
  
  session.lastActivity = Date.now()
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    path: '/',
  })
}

/**
 * Check if session needs refresh
 */
export async function shouldRefreshSession(): Promise<boolean> {
  const session = await getSession()
  
  if (!session) {
    return false
  }
  
  const timeRemaining = session.expiresAt - Date.now()
  const refreshThreshold = REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000
  
  return timeRemaining < refreshThreshold
}

/**
 * Refresh session expiration
 */
export async function refreshSession(): Promise<SessionData | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  const now = Date.now()
  session.expiresAt = now + SESSION_EXPIRY_HOURS * 60 * 60 * 1000
  session.lastActivity = now
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    path: '/',
  })
  
  console.log('Session refreshed:', {
    userId: session.userId,
    newExpiresAt: new Date(session.expiresAt).toISOString(),
  })
  
  return session
}

/**
 * Destroy session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession()
  
  if (session) {
    console.log('Session destroyed:', {
      userId: session.userId,
      duration: Date.now() - session.createdAt,
    })
  }
  
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Validate session and update activity
 */
export async function validateSession(): Promise<SessionData | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  // Update activity timestamp
  await updateSessionActivity()
  
  // Refresh if needed
  if (await shouldRefreshSession()) {
    return await refreshSession()
  }
  
  return session
}
