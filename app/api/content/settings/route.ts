/**
 * Public Settings API
 * GET /api/content/settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        NOT: {
          category: { in: ['email', 'api'] },
        },
      },
    })

    const grouped: Record<string, Record<string, string>> = {}
    settings.forEach((setting) => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {}
      }
      grouped[setting.category][setting.key] = setting.value
    })

    const response = NextResponse.json(grouped)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=1200'
    )

    return response
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Ayarlar yüklenemedi' }, { status: 500 })
  }
}
