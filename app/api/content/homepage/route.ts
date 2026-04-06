/**
 * Public Homepage Content API
 * GET /api/content/homepage
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const content = await prisma.siteContent.findMany({
      where: { section: 'homepage' },
    })

    const data: Record<string, any> = {}
    content.forEach((item) => {
      data[item.key] = item.value
    })

    const response = NextResponse.json(data || {})
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )

    return response
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ error: 'Sayfa yüklenemedi' }, { status: 500 })
  }
}
