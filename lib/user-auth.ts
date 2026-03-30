/**
 * User Authentication
 * 
 * Handles customer authentication with JWT tokens
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_COOKIE_NAME = 'user_token'
const TOKEN_EXPIRY = '7d' // 7 days

export interface UserPayload {
  userId: string
  email: string
  name: string
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    return null
  }
}

/**
 * Set auth token in cookie
 */
export async function setAuthToken(payload: UserPayload): Promise<void> {
  const token = generateToken(payload)
  const cookieStore = await cookies()
  
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(TOKEN_COOKIE_NAME)
    
    if (!token) {
      return null
    }
    
    return verifyToken(token.value)
  } catch (error) {
    return null
  }
}

/**
 * Clear auth token
 */
export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE_NAME)
}

/**
 * Register new user
 */
export async function registerUser(data: {
  email: string
  password: string
  name: string
  phone?: string
}): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    
    if (existingUser) {
      return {
        success: false,
        error: 'Bu email adresi zaten kayıtlı',
      }
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    })
    
    // Set auth token
    await setAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
    
    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Kayıt sırasında bir hata oluştu',
    }
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return {
        success: false,
        error: 'Email veya şifre hatalı',
      }
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    
    if (!isValid) {
      return {
        success: false,
        error: 'Email veya şifre hatalı',
      }
    }
    
    // Set auth token
    await setAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Giriş sırasında bir hata oluştu',
    }
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  await clearAuthToken()
}

/**
 * Require user authentication (middleware)
 */
export async function requireUserAuth(
  request: Request
): Promise<Response | null> {
  const user = await getCurrentUser()
  
  if (!user) {
    return new Response(
      JSON.stringify({
        error: 'Giriş yapmanız gerekiyor',
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
