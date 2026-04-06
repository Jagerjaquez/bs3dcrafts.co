import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateProductData } from '@/lib/validation'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { revalidatePublicCatalog } from '@/lib/revalidate-catalog'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // Check CSRF token
    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const body = await request.json()

    // Validate product data
    const validation = validateProductData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
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
        featured: body.featured || false,
        media: {
          create: body.images?.map((url: string, index: number) => ({
            type: 'image',
            url: url,
            order: index,
          })) || [],
        },
      },
      include: {
        media: true,
      },
    })

    // Log audit
    await logAudit({
      action: 'product_created',
      userId: 'admin',
      success: true,
      details: { productId: product.id, productName: product.name },
    })

    revalidatePublicCatalog(product.slug)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    await logAudit({
      action: 'product_created',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    
    return NextResponse.json(
      { error: 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        media: true,
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Ürünler getirilemedi' },
      { status: 500 }
    )
  }
}
