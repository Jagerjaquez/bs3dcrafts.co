import { NextRequest, NextResponse } from 'next/server'
import { logoutAdmin } from '@/lib/admin-auth'
import { clearCSRFToken } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
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
