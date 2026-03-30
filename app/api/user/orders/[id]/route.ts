import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Await params
    const { id } = await params

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { userId: currentUser.userId },
          { email: currentUser.email },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                media: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Get order API error:', error)
    return NextResponse.json(
      { error: 'Sipariş detayları alınamadı' },
      { status: 500 }
    )
  }
}
