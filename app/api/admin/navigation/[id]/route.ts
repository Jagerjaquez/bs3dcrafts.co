import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { NavigationSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath, revalidateTag } from 'next/cache'

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
    const validation = NavigationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.format() },
        { status: 400 }
      )
    }

    const existing = await prisma.navigation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Öğe bulunamadı' }, { status: 404 })
    }

    const { type, label, url, parentId, order } = validation.data

    if (parentId) {
      if (parentId === id) {
        return NextResponse.json({ error: 'Öğe kendi üst öğesi olamaz' }, { status: 400 })
      }
      const parent = await prisma.navigation.findUnique({ where: { id: parentId } })
      if (!parent) {
        return NextResponse.json({ error: 'Ana öğe bulunamadı' }, { status: 404 })
      }
      if (parent.parentId) {
        return NextResponse.json(
          { error: 'Maksimum 2 seviye desteklenebilir' },
          { status: 400 }
        )
      }
    }

    const item = await prisma.navigation.update({
      where: { id },
      data: { type, label, url, parentId: parentId ?? null, order },
    })

    await logAudit({
      action: 'navigation_updated',
      userId: 'admin',
      success: true,
      details: { navigationId: item.id, label },
    })

    // Enhanced cache invalidation for performance optimization
    revalidatePath('/')
    revalidatePath('/api/content/navigation')
    revalidateTag('navigation-content', 'max')
    revalidateTag('public-content', 'max')
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Navigation update error:', error)
    return NextResponse.json(
      { error: 'Navigasyon güncellenemedi' },
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
    
    // Find the navigation item with its children to track what will be deleted
    const existing = await prisma.navigation.findUnique({ 
      where: { id },
      include: { children: true }
    })
    
    if (!existing) {
      return NextResponse.json({ error: 'Öğe bulunamadı' }, { status: 404 })
    }

    // Count children for audit logging
    const childrenCount = existing.children.length

    // Delete navigation item (cascade delete will handle children automatically)
    await prisma.navigation.delete({ where: { id } })

    await logAudit({
      action: 'navigation_deleted',
      userId: 'admin',
      success: true,
      details: { 
        navigationId: id, 
        label: existing.label,
        childrenDeleted: childrenCount
      },
    })

    // Enhanced cache invalidation for performance optimization
    revalidatePath('/')
    revalidatePath('/api/content/navigation')
    revalidateTag('navigation-content', 'max')
    revalidateTag('public-content', 'max')
    
    return NextResponse.json({ 
      success: true, 
      message: childrenCount > 0 
        ? `Navigasyon öğesi ve ${childrenCount} alt öğesi silindi`
        : 'Navigasyon öğesi silindi'
    })
  } catch (error) {
    console.error('Navigation delete error:', error)
    return NextResponse.json(
      { error: 'Navigasyon silinemedi' },
      { status: 500 }
    )
  }
}
