import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/orders/[sessionId]
 * 
 * Fetches order details by Stripe session ID
 * Returns order with items and product details
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing sessionId
 * @returns Order details with items or 404 if not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch order by stripePaymentId (session ID) with items and product details
    const order = await prisma.order.findUnique({
      where: { stripePaymentId: sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
