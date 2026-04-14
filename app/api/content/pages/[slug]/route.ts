/**
 * Public Page by Slug API
 * GET /api/content/pages/[slug]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Optimized query with select only needed fields
    const page = await prisma.page.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        keywords: true,
        status: true,
        updatedAt: true
      }
    })

    if (!page || page.status !== 'published') {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    const response = NextResponse.json(page)
    
    // Enhanced caching headers for performance optimization
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600, max-age=60'
    )
    response.headers.set('Vary', 'Accept-Encoding')
    response.headers.set('ETag', `"page-${slug}-${page.updatedAt.getTime()}"`)
    response.headers.set('Last-Modified', page.updatedAt.toUTCString())

    return response
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Sayfa yüklenemedi' }, { status: 500 })
  }
}
