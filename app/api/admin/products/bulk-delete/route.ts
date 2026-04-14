import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog'
import { deleteImagesFromStorage } from '@/lib/supabase-storage'

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

    // Get products with their media before deletion
    const toDelete = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { 
        slug: true,
        media: {
          select: { url: true }
        }
      },
    })

    // Collect all media URLs that need to be deleted from CDN
    const mediaUrls: string[] = []
    for (const product of toDelete) {
      for (const media of product.media) {
        mediaUrls.push(media.url)
        // Also add the different sizes (thumbnail, medium, large)
        const baseUrl = media.url.replace('-large-', '-')
        mediaUrls.push(
          baseUrl.replace('-large-', '-thumbnail-'),
          baseUrl.replace('-large-', '-medium-')
        )
      }
    }

    // Delete products (this will cascade delete ProductMedia records)
    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    })

    // Delete associated media files from CDN
    if (mediaUrls.length > 0) {
      try {
        await deleteImagesFromStorage(mediaUrls)
      } catch (storageError) {
        console.error('Failed to delete some media files from storage:', storageError)
        // Continue execution - database cleanup is more important
      }
    }

    await logAudit({
      action: 'product_deleted',
      userId: 'admin',
      success: true,
      details: { 
        bulk: true, 
        requestedIds: ids, 
        deletedCount: result.count,
        mediaFilesDeleted: mediaUrls.length
      },
    })

    revalidatePublicCatalog()
    for (const p of toDelete) revalidatePublicCatalog(p.slug)

    return NextResponse.json({ 
      deleted: result.count,
      mediaFilesDeleted: mediaUrls.length
    })
  } catch (error) {
    console.error('Bulk delete products error:', error)
    return NextResponse.json({ error: 'Toplu silme başarısız' }, { status: 500 })
  }
}
