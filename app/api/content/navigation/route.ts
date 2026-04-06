/**
 * Public Navigation API
 * GET /api/content/navigation
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.navigation.findMany({
      include: {
        children: { orderBy: { order: 'asc' } },
      },
      where: { parentId: null },
      orderBy: { order: 'asc' },
    })

    const response = NextResponse.json(items)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )

    return response
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Navigasyon yüklenemedi' }, { status: 500 })
  }
}
