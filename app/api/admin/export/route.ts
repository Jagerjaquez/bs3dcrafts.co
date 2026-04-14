import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = requireAdminAuth(request)
    if (authError) {
      return authError
    }

    const { searchParams } = new URL(request.url)
    const sections = searchParams.get('sections')?.split(',') || ['all']

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      sections: {}
    }

    // Export all or specific sections
    if (sections.includes('all') || sections.includes('content')) {
      const siteContent = await prisma.siteContent.findMany({
        orderBy: { key: 'asc' }
      })
      exportData.sections.content = siteContent
    }

    if (sections.includes('all') || sections.includes('pages')) {
      const pages = await prisma.page.findMany({
        orderBy: { createdAt: 'desc' }
      })
      exportData.sections.pages = pages
    }

    if (sections.includes('all') || sections.includes('products')) {
      const products = await prisma.product.findMany({
        include: {
          media: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      exportData.sections.products = products
    }

    if (sections.includes('all') || sections.includes('settings')) {
      const settings = await prisma.settings.findMany({
        orderBy: { category: 'asc' }
      })
      exportData.sections.settings = settings
    }

    if (sections.includes('all') || sections.includes('navigation')) {
      const navigation = await prisma.navigation.findMany({
        orderBy: [{ type: 'asc' }, { order: 'asc' }]
      })
      exportData.sections.navigation = navigation
    }

    if (sections.includes('all') || sections.includes('media')) {
      const media = await prisma.media.findMany({
        orderBy: { uploadedAt: 'desc' }
      })
      exportData.sections.media = media
    }

    // Set appropriate headers for file download
    const filename = `bs3dcrafts-backup-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}