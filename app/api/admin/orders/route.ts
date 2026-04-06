import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { Prisma } from '@prisma/client'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || searchParams.get('search') || '').trim()
    const status = searchParams.get('status') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    )

    const where: Prisma.OrderWhereInput = {}
    if (status) {
      where.status = status
    }
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { id: { contains: q } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    })
  } catch (error) {
    console.error('Admin orders list error:', error)
    return NextResponse.json({ error: 'Siparişler getirilemedi' }, { status: 500 })
  }
}
