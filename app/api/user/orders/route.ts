import { NextResponse } from 'next/server'
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

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: {
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
                media: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders API error:', error)
    return NextResponse.json(
      { error: 'Siparişler alınamadı' },
      { status: 500 }
    )
  }
}
