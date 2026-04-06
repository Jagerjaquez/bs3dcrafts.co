/**
 * Admin Pages Management API
 * POST /api/admin/pages - Create page
 * GET /api/admin/pages - List pages
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { PageSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/slug'
import { sanitizeHTML } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    const skip = (page - 1) * limit
    const where: any = {}

    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.page.count({ where }),
    ])

    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Sayfalar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

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

    // Auto-generate slug if not provided
    if (!slug) {
      slug = generateSlug(title)
    }

    // Check slug uniqueness
    const existing = await prisma.page.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu slug zaten mevcut' },
        { status: 409 }
      )
    }

    // Sanitize HTML content
    const sanitizedContent = sanitizeHTML(content)

    const page = await prisma.page.create({
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
      action: 'page_created',
      userId: 'admin',
      success: true,
      details: { pageId: page.id, pageTitle: title },
    })

    revalidatePath('/')
    revalidatePath(`/${slug}`)
    revalidatePath(`/sayfa/${slug}`)

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    await logAudit({
      action: 'page_created',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Sayfa oluşturulamadı' },
      { status: 500 }
    )
  }
}
