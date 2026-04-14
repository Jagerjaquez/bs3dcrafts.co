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

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Optimized query with pagination and select only needed fields
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountedPrice: true,
          stock: true,
          category: true,
          status: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
          media: {
            select: {
              id: true,
              url: true,
              type: true,
              order: true
            },
            orderBy: { order: 'asc' },
            take: 1 // Only get first image for list view
          }
        }
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Ürünler getirilemedi' },
      { status: 500 }
    )
  }
}
