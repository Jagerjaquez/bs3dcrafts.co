import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const
type OrderStatus = (typeof STATUSES)[number]

function isOrderStatus(s: string): s is OrderStatus {
  return (STATUSES as readonly string[]).includes(s)
}

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
    const trackingNumber =
      typeof body?.trackingNumber === 'string' ? body.trackingNumber.trim() : undefined

    if (!status || !isOrderStatus(status)) {
      return NextResponse.json(
        { error: `Geçersiz durum. İzin verilen: ${STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber !== undefined
          ? { trackingNumber: trackingNumber || null }
          : {}),
      },
      include: {
        items: { include: { product: true } },
      },
    })

    await logAudit({
      action: 'order_status_changed',
      userId: 'admin',
      success: true,
      details: {
        orderId: id,
        previousStatus: existing.status,
        newStatus: status,
        trackingNumber: trackingNumber ?? existing.trackingNumber,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json({ error: 'Sipariş güncellenemedi' }, { status: 500 })
  }
}
