import { NextRequest, NextResponse } from 'next/server'
import { paytr } from '@/lib/paytr-client'
import { updatePayTROrderStatus, getOrderByMerchantOid } from '@/lib/order-manager'
import { logError } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // Convert FormData to object
    const postData: Record<string, string> = {}
    formData.forEach((value, key) => {
      postData[key] = value.toString()
    })

    const {
      merchant_oid,
      status,
      total_amount,
      payment_type,
      installment_count,
      currency,
      test_mode,
    } = postData

    // Verify callback authenticity
    if (!paytr.verifyCallback(postData)) {
      logError('paytr-webhook', 'Invalid callback hash', { merchant_oid })
      return new NextResponse('OK', { status: 200 }) // Return OK to prevent retries
    }

    // Find existing order
    const order = await getOrderByMerchantOid(merchant_oid)

    if (!order) {
      logError('paytr-webhook', 'Order not found', { merchant_oid })
      return new NextResponse('OK', { status: 200 }) // Return OK to prevent retries
    }

    // Update order status based on payment result
    const newStatus = status === 'success' ? 'paid' : 'failed'
    
    try {
      await updatePayTROrderStatus(merchant_oid, newStatus)
      
      // Log payment details
      console.log('PayTR Payment Callback:', {
        merchant_oid,
        status,
        total_amount,
        payment_type,
        installment_count,
        currency,
        test_mode,
        order_status: newStatus,
      })
    } catch (error) {
      logError('paytr-webhook', 'Failed to update order status', {
        merchant_oid,
        error: (error as Error).message,
      })
    }

    // Return OK to PayTR
    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    const err = error as Error
    logError('paytr-webhook', err, {
      endpoint: '/api/webhooks/paytr',
    })
    
    // Always return OK to prevent PayTR from retrying
    return new NextResponse('OK', { status: 200 })
  }
}
