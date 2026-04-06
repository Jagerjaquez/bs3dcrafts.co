import { NextRequest, NextResponse } from 'next/server'
import { logoutAdmin } from '@/lib/admin-auth'
import { clearCSRFToken, requireCSRFToken } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    // Check CSRF token
    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    await logoutAdmin(request)
    await clearCSRFToken()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Çıkış başarısız' },
      { status: 500 }
    )
  }
}
