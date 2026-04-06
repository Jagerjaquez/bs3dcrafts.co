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
    const page = await prisma.page.findUnique({
      where: { slug },
    })

    if (!page || page.status !== 'published') {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    const response = NextResponse.json(page)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )

    return response
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Sayfa yüklenemedi' }, { status: 500 })
  }
}
