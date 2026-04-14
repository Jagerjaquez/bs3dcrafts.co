/**
 * Admin Content Management API - Dynamic Key Route
 * PUT /api/admin/content/:key - Update site content
 * DELETE /api/admin/content/:key - Delete site content
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { ContentSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CMS_CACHE_TAG } from '@/lib/cms-public'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { key } = await params

    if (!key) {
      return NextResponse.json(
        { error: 'Anahtar parametresi gerekli' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate value field
    const validation = ContentSchema.pick({ value: true }).safeParse({ value: body.value })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Check if content exists
    const existing = await prisma.siteContent.findUnique({
      where: { key },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      )
    }

    const content = await prisma.siteContent.update({
      where: { key },
      data: { value: body.value },
    })

    await logAudit({
      action: 'content_updated',
      userId: 'admin',
      success: true,
      details: { contentKey: key },
    })

    // Enhanced cache invalidation for performance optimization
    revalidatePath('/')
    revalidatePath('/api/content/homepage')
    revalidateTag('cms', 'max')
    revalidateTag('homepage-content', 'max')
    revalidateTag('public-content', 'max')

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating content:', error)
    await logAudit({
      action: 'content_updated',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    
    return NextResponse.json(
      { error: 'İçerik güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { key } = await params

    if (!key) {
      return NextResponse.json(
        { error: 'Anahtar parametresi gerekli' },
        { status: 400 }
      )
    }

    // Check if content exists
    const existing = await prisma.siteContent.findUnique({
      where: { key },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      )
    }

    await prisma.siteContent.delete({
      where: { key },
    })

    await logAudit({
      action: 'content_deleted',
      userId: 'admin',
      success: true,
      details: { contentKey: key },
    })

    // Enhanced cache invalidation for performance optimization
    revalidatePath('/')
    revalidatePath('/api/content/homepage')
    revalidateTag('cms', 'max')
    revalidateTag('homepage-content', 'max')
    revalidateTag('public-content', 'max')

    return NextResponse.json({ message: 'Başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting content:', error)
    await logAudit({
      action: 'content_deleted',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    
    return NextResponse.json(
      { error: 'İçerik silinemedi' },
      { status: 500 }
    )
  }
}
