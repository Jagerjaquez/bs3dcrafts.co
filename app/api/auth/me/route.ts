import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Giriş yapılmamış' },
        { status: 401 }
      )
    }

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınamadı' },
      { status: 500 }
    )
  }
}
