import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  try {
    const isAuth = await isAdminAuthenticated()
    
    if (!isAuth) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}
