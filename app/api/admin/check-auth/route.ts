import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getCSRFToken, setCSRFToken } from '@/lib/csrf'

export async function GET() {
  try {
    const isAuth = await isAdminAuthenticated()

    if (!isAuth) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    let csrfToken = await getCSRFToken()
    if (!csrfToken) {
      csrfToken = await setCSRFToken()
    }

    return NextResponse.json({ authenticated: true, csrfToken })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
