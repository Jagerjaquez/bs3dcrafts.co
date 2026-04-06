import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog'

const MAX_BATCH = 100

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const body = await request.json()
    const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : []
    const data = body?.data && typeof body.data === 'object' ? body.data : null

    if (ids.length === 0 || !data) {
      return NextResponse.json({ error: 'ids ve data gerekli' }, { status: 400 })
    }
    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `En fazla ${MAX_BATCH} ürün güncellenebilir` },
        { status: 400 }
      )
    }

    const patch: {
      featured?: boolean
      status?: string
      category?: string
    } = {}

    if (typeof data.featured === 'boolean') {
      patch.featured = data.featured
    }
    if (typeof data.status === 'string') {
      if (!['draft', 'published'].includes(data.status)) {
        return NextResponse.json({ error: 'Geçersiz status' }, { status: 400 })
      }
      patch.status = data.status
    }
    if (typeof data.category === 'string' && data.category.trim()) {
      patch.category = data.category.trim()
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenebilir alan yok (featured, status, category)' },
        { status: 400 }
      )
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: patch,
    })

    await logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: true,
      details: { bulk: true, ids, patch },
    })

    revalidatePublicCatalog()
    const slugs = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { slug: true },
    })
    for (const p of slugs) revalidatePublicCatalog(p.slug)

    return NextResponse.json({ updated: result.count })
  } catch (error) {
    console.error('Bulk update products error:', error)
    return NextResponse.json({ error: 'Toplu güncelleme başarısız' }, { status: 500 })
  }
}
