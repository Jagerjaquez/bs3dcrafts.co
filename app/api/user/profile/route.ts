import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Ad soyad gerekli' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json(
      { error: 'Profil güncellenemedi' },
      { status: 500 }
    )
  }
}
