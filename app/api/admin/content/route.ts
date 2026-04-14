/**
 * Admin Content Management API
 * POST /api/admin/content - Create site content
 * GET /api/admin/content - List all site content
 * 
 * Note: PUT and DELETE operations are handled by /api/admin/content/[key]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { ContentSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CMS_CACHE_TAG } from '@/lib/cms-public'
import { withAdminSecurityHeaders, createSecureErrorResponse } from '@/lib/security-headers'

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const content = await prisma.siteContent.findMany({
      orderBy: { section: 'asc' },
    })

    const response = NextResponse.json(content)
    return withAdminSecurityHeaders(response)
  } catch (error) {
    console.error('Error fetching content:', error)
    return createSecureErrorResponse('İçerik getirilemedi', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const body = await request.json()

    // Validate input
    const validation = ContentSchema.safeParse(body)
    if (!validation.success) {
      return createSecureErrorResponse(
        'Geçersiz veri',
        400
      )
    }

    const { key, value, section } = validation.data

    // Check if key already exists
    const existing = await prisma.siteContent.findUnique({
      where: { key },
    })

    if (existing) {
      return createSecureErrorResponse('Bu anahtar zaten mevcut', 409)
    }

    const content = await prisma.siteContent.create({
      data: {
        key,
        value: value as any,
        section,
      },
    })

    await logAudit({
      action: 'content_created',
      userId: 'admin',
      success: true,
      details: { contentKey: key, contentId: content.id, section },
    })

    revalidatePath('/')
    revalidatePath('/api/content/homepage')
    revalidateTag('cms', 'max')

    const response = NextResponse.json(content, { status: 201 })
    return withAdminSecurityHeaders(response)
  } catch (error) {
    console.error('Error creating content:', error)
    await logAudit({
      action: 'content_created',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    
    return createSecureErrorResponse('İçerik oluşturulamadı', 500)
  }
}
