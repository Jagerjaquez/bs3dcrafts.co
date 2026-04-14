/**
 * Public Homepage Content API
 * GET /api/content/homepage
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Optimized query with select only needed fields
    const content = await prisma.siteContent.findMany({
      where: { section: 'homepage' },
      select: {
        key: true,
        value: true,
        updatedAt: true
      }
    })

    const data: Record<string, any> = {}
    content.forEach((item) => {
      data[item.key] = item.value
    })

    const response = NextResponse.json(data || {})
    
    // Enhanced caching headers for performance optimization
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600, max-age=60'
    )
    response.headers.set('Vary', 'Accept-Encoding')
    response.headers.set('ETag', `"homepage-${Date.now()}"`)

    return response
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ error: 'Sayfa yüklenemedi' }, { status: 500 })
  }
}
