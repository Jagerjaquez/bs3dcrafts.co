import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { validateProductData } from '@/lib/validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        media: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Ürün getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // Check CSRF token
    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { id } = await params
    const body = await request.json()

    // Validate that we only allow price and stock updates for quick edit
    const allowedFields = ['price', 'stock']
    const updateData: { price?: number; stock?: number } = {}

    if (body.price !== undefined) {
      const price = parseFloat(body.price)
      if (isNaN(price) || price < 0) {
        return NextResponse.json({ error: 'Geçersiz fiyat değeri' }, { status: 400 })
      }
      updateData.price = price
    }

    if (body.stock !== undefined) {
      const stock = parseInt(body.stock)
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json({ error: 'Geçersiz stok değeri' }, { status: 400 })
      }
      updateData.stock = stock
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    await logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: true,
      details: { 
        productId: product.id, 
        productName: product.name,
        quickEdit: true,
        updatedFields: Object.keys(updateData)
      },
    })

    revalidatePublicCatalog(existing.slug)

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error quick updating product:', error)
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // Check CSRF token
    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { id } = await params
    const body = await request.json()

    const validation = validateProductData(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 })
    }

    if (
      body.status !== undefined &&
      body.status !== null &&
      !['draft', 'published'].includes(body.status)
    ) {
      return NextResponse.json({ error: 'Geçersiz ürün durumu' }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }

    const product = await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.images)) {
        await tx.productMedia.deleteMany({ where: { productId: id } })
        const urls = body.images.filter((u: unknown) => typeof u === 'string' && u.length > 0)
        if (urls.length > 0) {
          await tx.productMedia.createMany({
            data: urls.map((url: string, index: number) => ({
              productId: id,
              type: 'image',
              url,
              order: index,
            })),
          })
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: body.price,
          discountedPrice: body.discountedPrice,
          stock: body.stock,
          category: body.category,
          material: body.material,
          printTimeEstimate: body.printTimeEstimate,
          weight: body.weight,
          featured: body.featured,
          ...(typeof body.status === 'string' ? { status: body.status } : {}),
        },
        include: { media: { orderBy: { order: 'asc' } } },
      })
    })

    await logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: true,
      details: { productId: product.id, productName: product.name },
    })

    revalidatePublicCatalog(existing.slug)
    if (product.slug !== existing.slug) revalidatePublicCatalog(product.slug)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // Check CSRF token
    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const { id } = await params
    const existing = await prisma.product.findUnique({ where: { id } })
    await prisma.product.delete({
      where: { id },
    })

    if (existing) {
      await logAudit({
        action: 'product_deleted',
        userId: 'admin',
        success: true,
        details: { productId: id, productName: existing.name },
      })
      revalidatePublicCatalog(existing.slug)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    )
  }
}
