/**
 * Public Settings API
 * GET /api/content/settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Optimized query with select only needed fields
    const settings = await prisma.settings.findMany({
      where: {
        NOT: {
          category: { in: ['email', 'api'] },
        },
      },
      select: {
        key: true,
        value: true,
        category: true
      }
    })

    const grouped: Record<string, Record<string, string>> = {}
    settings.forEach((setting) => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {}
      }
      grouped[setting.category][setting.key] = setting.value
    })

    const response = NextResponse.json(grouped)
    
    // Enhanced caching headers for performance optimization (longer cache for settings)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=1200, max-age=300'
    )
    response.headers.set('Vary', 'Accept-Encoding')
    response.headers.set('ETag', `"settings-${Date.now()}"`)

    return response
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Ayarlar yüklenemedi' }, { status: 500 })
  }
}
