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

    if (ids.length === 0) {
      return NextResponse.json({ error: 'En az bir ürün id gerekli' }, { status: 400 })
    }
    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `En fazla ${MAX_BATCH} ürün silinebilir` },
        { status: 400 }
      )
    }

    const toDelete = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { slug: true },
    })

    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    })

    await logAudit({
      action: 'product_deleted',
      userId: 'admin',
      success: true,
      details: { bulk: true, requestedIds: ids, deletedCount: result.count },
    })

    revalidatePublicCatalog()
    for (const p of toDelete) revalidatePublicCatalog(p.slug)

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Bulk delete products error:', error)
    return NextResponse.json({ error: 'Toplu silme başarısız' }, { status: 500 })
  }
}
