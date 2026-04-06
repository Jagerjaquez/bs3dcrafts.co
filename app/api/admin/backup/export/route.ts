import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const [siteContent, pages, settings, navigation, media] = await Promise.all([
      prisma.siteContent.findMany(),
      prisma.page.findMany(),
      prisma.settings.findMany(),
      prisma.navigation.findMany(),
      prisma.media.findMany({
        select: {
          id: true,
          filename: true,
          url: true,
          type: true,
          size: true,
          dimensions: true,
          usageCount: true,
          uploadedAt: true,
        },
      }),
    ])

    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      siteContent,
      pages,
      settings,
      navigation,
      media,
    }

    return NextResponse.json(payload, {
      headers: {
        'Content-Disposition': `attachment; filename="cms-backup-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Backup export error:', error)
    return NextResponse.json({ error: 'Dışa aktarma başarısız' }, { status: 500 })
  }
}
