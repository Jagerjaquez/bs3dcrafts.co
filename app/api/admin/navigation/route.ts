/**
 * Admin Navigation Management API
 * GET /api/admin/navigation - Get all navigation items
 * POST /api/admin/navigation - Create navigation item
 * PUT /api/admin/navigation/:id - Update navigation item
 * DELETE /api/admin/navigation/:id - Delete navigation item
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { NavigationSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const items = await prisma.navigation.findMany({
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
      where: { parentId: null },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json(
      { error: 'Navigasyon getirilemedi' },
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
    const validation = NavigationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { type, label, url, parentId, order } = validation.data

    // Validate max depth (2 levels)
    if (parentId) {
      const parent = await prisma.navigation.findUnique({
        where: { id: parentId },
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Ana öğe bulunamadı' },
          { status: 404 }
        )
      }

      if (parent.parentId) {
        return NextResponse.json(
          { error: 'Maksimum 2 seviye desteklenebilir' },
          { status: 400 }
        )
      }
    }

    const item = await prisma.navigation.create({
      data: {
        type,
        label,
        url,
        parentId,
        order,
      },
    })

    await logAudit({
      action: 'navigation_created',
      userId: 'admin',
      success: true,
      details: { navigationId: item.id, label },
    })

    revalidatePath('/')

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating navigation:', error)
    await logAudit({
      action: 'navigation_created',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Navigasyon öğesi oluşturulamadı' },
      { status: 500 }
    )
  }
}
