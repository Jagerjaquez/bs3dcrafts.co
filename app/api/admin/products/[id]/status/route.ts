import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog'

const STATUSES = ['draft', 'published'] as const

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
    const status = body?.status as string | undefined

    if (!status || !(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum: draft veya published olmalı' },
        { status: 400 }
      )
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status },
      include: { media: true },
    })

    await logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: true,
      details: { productId: id, productName: product.name, status },
    })

    revalidatePublicCatalog(product.slug)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product status update error:', error)
    return NextResponse.json({ error: 'Durum güncellenemedi' }, { status: 500 })
  }
}
