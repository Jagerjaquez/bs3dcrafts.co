/**
 * Public Content API Endpoints
 * GET /api/content/homepage - Homepage content
 * GET /api/content/navigation - Navigation structure
 * GET /api/content/pages/:slug - Page by slug
 * GET /api/content/settings - Public site settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Homepage content endpoint
 * Returns hero, carousel, testimonials, stats, newsletter data
 */
export async function GET_HOMEPAGE(request: NextRequest) {
  try {
    const content = await prisma.siteContent.findMany({
      where: {
        section: 'homepage',
      },
    })

    // Create content map
    const data: Record<string, any> = {}
    content.forEach((item) => {
      data[item.key] = item.value
    })

    // Set cache headers (5 minutes)
    const response = NextResponse.json(data)
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

/**
 * Navigation endpoint
 * Returns header and footer navigation with hierarchy
 */
export async function GET_NAVIGATION(request: NextRequest) {
  try {
    const items = await prisma.navigation.findMany({
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
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

/**
 * Page by slug endpoint
 * Returns published pages only
 */
export async function GET_PAGE_BY_SLUG(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
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

/**
 * Public settings endpoint
 * Excludes sensitive settings (SMTP, API keys)
 */
export async function GET_PUBLIC_SETTINGS(request: NextRequest) {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        NOT: {
          category: {
            in: ['email', 'api'],
          },
        },
      },
    })

    // Group by category
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
