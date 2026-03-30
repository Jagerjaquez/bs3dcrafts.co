import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/user-auth'
import { isValidEmail } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, şifre ve isim gerekli' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email adresi' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Şifre en az 8 karakter olmalı' },
        { status: 400 }
      )
    }

    // Register user
    const result = await registerUser({ email, password, name, phone })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { error: 'Kayıt başarısız' },
      { status: 500 }
    )
  }
}
