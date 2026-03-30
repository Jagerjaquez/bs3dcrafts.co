import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId: currentUser.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Get addresses API error:', error)
    return NextResponse.json(
      { error: 'Adresler alınamadı' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, line1, line2, city, state, postalCode, country, isDefault } = body

    // Validation
    if (!name || !line1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'Zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: currentUser.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: currentUser.userId,
        name,
        line1,
        line2,
        city,
        state,
        postalCode,
        country: country || 'Turkey',
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error('Create address API error:', error)
    return NextResponse.json(
      { error: 'Adres eklenemedi' },
      { status: 500 }
    )
  }
}
