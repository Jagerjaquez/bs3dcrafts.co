import { NextRequest, NextResponse } from 'next/server'
import { getOrderByMerchantOid } from '@/lib/order-manager'
import { createErrorResponse, ErrorCode, ERROR_MESSAGES } from '@/lib/error-handler'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    if (!orderId) {
      const errorResponse = createErrorResponse(
        'Order ID is required',
        ErrorCode.VALIDATION_ERROR
      )
      return NextResponse.json(errorResponse, { status: 400 })
    }

    const order = await getOrderByMerchantOid(orderId)

    if (!order) {
      const errorResponse = createErrorResponse(
        ERROR_MESSAGES.ORDER_NOT_FOUND,
        ErrorCode.NOT_FOUND
      )
      return NextResponse.json(errorResponse, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching PayTR order:', error)
    const errorResponse = createErrorResponse(
      ERROR_MESSAGES.GENERIC_ERROR,
      ErrorCode.GENERIC_ERROR
    )
    return NextResponse.json(errorResponse, { status: 500 })
  }
}