import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { requireCSRFToken } from '@/lib/csrf'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const ImportDataSchema = z.object({
  exportedAt: z.string(),
  version: z.string(),
  sections: z.object({
    content: z.array(z.object({
      id: z.string().optional(),
      key: z.string(),
      value: z.any(),
      section: z.string(),
      updatedAt: z.string().optional()
    })).optional(),
    pages: z.array(z.object({
      id: z.string().optional(),
      title: z.string(),
      slug: z.string(),
      content: z.string(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.string().optional(),
      status: z.string(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional()
    })).optional(),
    settings: z.array(z.object({
      id: z.string().optional(),
      key: z.string(),
      value: z.string(),
      category: z.string(),
      updatedAt: z.string().optional()
    })).optional(),
    navigation: z.array(z.object({
      id: z.string().optional(),
      type: z.string(),
      label: z.string(),
      url: z.string(),
      parentId: z.string().optional(),
      order: z.number(),
      createdAt: z.string().optional()
    })).optional(),
    media: z.array(z.object({
      id: z.string().optional(),
      filename: z.string(),
      url: z.string(),
      type: z.string(),
      size: z.number(),
      dimensions: z.string().optional(),
      usageCount: z.number().optional(),
      uploadedAt: z.string().optional()
    })).optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    const csrfError = await requireCSRFToken(request)
    if (csrfError) {
      return csrfError
    }

    // Verify admin authentication
    const authError = requireAdminAuth(request)
    if (authError) {
      return authError
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const preview = formData.get('preview') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read and parse JSON file
    const fileContent = await file.text()
    let importData

    try {
      importData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON file' },
        { status: 400 }
      )
    }

    // Validate import data structure
    const validation = ImportDataSchema.safeParse(importData)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid import data structure',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const { sections } = validation.data

    // If preview mode, return what would be imported
    if (preview) {
      const previewData = {
        summary: {
          content: sections.content?.length || 0,
          pages: sections.pages?.length || 0,
          settings: sections.settings?.length || 0,
          navigation: sections.navigation?.length || 0,
          media: sections.media?.length || 0
        },
        changes: {
          content: sections.content?.map(item => ({
            action: 'upsert',
            key: item.key,
            section: item.section
          })) || [],
          pages: sections.pages?.map(page => ({
            action: 'upsert',
            title: page.title,
            slug: page.slug
          })) || [],
          settings: sections.settings?.map(setting => ({
            action: 'upsert',
            key: setting.key,
            category: setting.category
          })) || [],
          navigation: sections.navigation?.map(nav => ({
            action: 'upsert',
            label: nav.label,
            type: nav.type
          })) || [],
          media: sections.media?.map(media => ({
            action: 'create',
            filename: media.filename,
            type: media.type
          })) || []
        }
      }

      return NextResponse.json({ preview: previewData })
    }

    // Apply import - use transaction for data integrity
    const result = await prisma.$transaction(async (tx) => {
      const results = {
        content: 0,
        pages: 0,
        settings: 0,
        navigation: 0,
        media: 0
      }

      // Import content
      if (sections.content) {
        for (const item of sections.content) {
          await tx.siteContent.upsert({
            where: { key: item.key },
            update: {
              value: item.value,
              section: item.section
            },
            create: {
              key: item.key,
              value: item.value,
              section: item.section
            }
          })
          results.content++
        }
      }

      // Import pages
      if (sections.pages) {
        for (const page of sections.pages) {
          await tx.page.upsert({
            where: { slug: page.slug },
            update: {
              title: page.title,
              content: page.content,
              metaTitle: page.metaTitle,
              metaDescription: page.metaDescription,
              keywords: page.keywords,
              status: page.status
            },
            create: {
              title: page.title,
              slug: page.slug,
              content: page.content,
              metaTitle: page.metaTitle,
              metaDescription: page.metaDescription,
              keywords: page.keywords,
              status: page.status
            }
          })
          results.pages++
        }
      }

      // Import settings
      if (sections.settings) {
        for (const setting of sections.settings) {
          await tx.settings.upsert({
            where: { key: setting.key },
            update: {
              value: setting.value,
              category: setting.category
            },
            create: {
              key: setting.key,
              value: setting.value,
              category: setting.category
            }
          })
          results.settings++
        }
      }

      // Import navigation (clear existing first to avoid conflicts)
      if (sections.navigation) {
        await tx.navigation.deleteMany({})
        for (const nav of sections.navigation) {
          await tx.navigation.create({
            data: {
              type: nav.type,
              label: nav.label,
              url: nav.url,
              parentId: nav.parentId,
              order: nav.order
            }
          })
          results.navigation++
        }
      }

      // Import media (create new records, don't overwrite)
      if (sections.media) {
        for (const media of sections.media) {
          // Check if media with same URL already exists
          const existing = await tx.media.findFirst({
            where: { url: media.url }
          })
          
          if (!existing) {
            await tx.media.create({
              data: {
                filename: media.filename,
                url: media.url,
                type: media.type,
                size: media.size,
                dimensions: media.dimensions,
                usageCount: media.usageCount || 0
              }
            })
            results.media++
          }
        }
      }

      return results
    })

    return NextResponse.json({
      success: true,
      message: 'Import completed successfully',
      imported: result
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  }
}