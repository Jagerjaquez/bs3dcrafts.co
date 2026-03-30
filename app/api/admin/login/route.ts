import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { setCSRFToken } from '@/lib/csrf'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Şifre gerekli' },
        { status: 400 }
      )
    }

    // Authenticate admin with enhanced security
    const result = await authenticateAdmin(password, req)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Set CSRF token for subsequent requests
    const csrfToken = await setCSRFToken()

    return NextResponse.json({ 
      success: true,
      csrfToken, // Return token for client to use in headers
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Giriş başarısız' },
      { status: 500 }
    )
  }
}
