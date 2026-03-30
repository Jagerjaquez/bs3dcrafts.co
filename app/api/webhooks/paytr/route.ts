import { NextRequest, NextResponse } from 'next/server'
import { paytr } from '@/lib/paytr-client'
import { prisma } from '@/lib/prisma'
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

    // Find or create order
    let order = await prisma.order.findFirst({
      where: { id: merchant_oid }
    })

    if (!order) {
      // Create order if it doesn't exist (shouldn't happen normally)
      order = await prisma.order.create({
        data: {
          id: merchant_oid,
          customerName: 'PayTR Customer',
          email: 'customer@paytr.com',
          phone: '',
          address: '',
          totalAmount: parseFloat(total_amount),
          status: status === 'success' ? 'completed' : 'failed',
        }
      })
    } else {
      // Update order status
      await prisma.order.update({
        where: { id: merchant_oid },
        data: {
          status: status === 'success' ? 'completed' : 'failed',
          totalAmount: parseFloat(total_amount),
        }
      })
    }

    // Log payment details
    console.log('PayTR Payment Callback:', {
      merchant_oid,
      status,
      total_amount,
      payment_type,
      installment_count,
      currency,
      test_mode,
    })

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
