import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { setCSRFToken } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = requireAdminAuth(request)
    if (authError) {
      return authError
    }

    // Generate and set CSRF token
    const token = await setCSRFToken()

    return NextResponse.json({ token })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}