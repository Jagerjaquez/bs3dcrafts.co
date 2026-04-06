/**
 * Admin Pages by ID Management API
 * PUT /api/admin/pages/[id] - Update page
 * DELETE /api/admin/pages/[id] - Delete page
 * GET /api/admin/pages/[id] - Get page details
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { PageSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'
import { sanitizeHTML } from '@/lib/sanitize'
import { createPageRedirect } from '@/lib/redirects'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const { id } = await params
    const page = await prisma.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Sayfa getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { id } = await params
    const body = await request.json()

    // Validate
    const validation = PageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.format() },
        { status: 400 }
      )
    }

    let { title, slug, content, status, metaTitle, metaDescription, keywords } = validation.data

    // Get current page
    const currentPage = await prisma.page.findUnique({
      where: { id },
    })

    if (!currentPage) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      )
    }

    // Check slug uniqueness (excluding current page)
    if (slug !== currentPage.slug) {
      const existing = await prisma.page.findUnique({
        where: { slug },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Bu slug zaten mevcut' },
          { status: 409 }
        )
      }
    }

    // Sanitize content
    const sanitizedContent = sanitizeHTML(content)

    // Create redirect if slug changed
    if (slug !== currentPage.slug) {
      await createPageRedirect(currentPage.slug, slug)
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content: sanitizedContent,
        metaTitle,
        metaDescription,
        keywords,
        status,
      },
    })

    await logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: true,
      details: { pageId: page.id, pageTitle: title },
    })

    revalidatePath('/')
    revalidatePath(`/${currentPage.slug}`)
    revalidatePath(`/${slug}`)
    revalidatePath(`/sayfa/${currentPage.slug}`)
    revalidatePath(`/sayfa/${slug}`)

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating page:', error)
    await logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Sayfa güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { id } = await params
    const page = await prisma.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      )
    }

    await prisma.page.delete({
      where: { id },
    })

    await logAudit({
      action: 'product_deleted',
      userId: 'admin',
      success: true,
      details: { pageId: id, pageTitle: page.title },
    })

    revalidatePath('/')
    revalidatePath(`/${page.slug}`)
    revalidatePath(`/sayfa/${page.slug}`)

    return NextResponse.json({ message: 'Sayfa başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting page:', error)
    await logAudit({
      action: 'product_deleted',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Sayfa silinemedi' },
      { status: 500 }
    )
  }
}
