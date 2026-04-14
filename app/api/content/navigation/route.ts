/**
 * Public Navigation API
 * GET /api/content/navigation
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Optimized query with select only needed fields and avoid N+1 queries
    const items = await prisma.navigation.findMany({
      where: { parentId: null },
      select: {
        id: true,
        type: true,
        label: true,
        url: true,
        order: true,
        children: {
          select: {
            id: true,
            label: true,
            url: true,
            order: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    const response = NextResponse.json(items)
    
    // Enhanced caching headers for performance optimization
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600, max-age=60'
    )
    response.headers.set('Vary', 'Accept-Encoding')
    response.headers.set('ETag', `"navigation-${Date.now()}"`)

    return response
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Navigasyon yüklenemedi' }, { status: 500 })
  }
}
