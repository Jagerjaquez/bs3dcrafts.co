import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const isAuth = await isAdminAuthenticated()
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Admin girişi gerekli.' },
        { status: 401 }
      )
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const isAuth = await isAdminAuthenticated()
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Admin girişi gerekli.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const product = await prisma.product.update({
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
      },
    })

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
    const isAuth = await isAdminAuthenticated()
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Admin girişi gerekli.' },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    )
  }
}
