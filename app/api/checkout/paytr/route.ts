import { NextRequest, NextResponse } from 'next/server'
import { paytr } from '@/lib/paytr-client'
import { checkRateLimit } from '@/lib/rate-limiter'
import { validateCustomerData, validateOrderItems } from '@/lib/validation'
import { createPayTROrder } from '@/lib/order-manager'
import { 
  createErrorResponse, 
  logError, 
  ErrorCode, 
  ERROR_MESSAGES 
} from '@/lib/error-handler'

export interface PayTRCheckoutRequest {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!checkRateLimit(req)) {
      const errorResponse = createErrorResponse(
        ERROR_MESSAGES.RATE_LIMIT,
        ErrorCode.RATE_LIMIT
      )
      return NextResponse.json(errorResponse, { status: 429 })
    }

    const body: PayTRCheckoutRequest = await req.json()
    const { items, customerInfo } = body

    // Validate customer data
    const customerValidation = validateCustomerData(customerInfo)
    if (!customerValidation.valid) {
      const errorResponse = createErrorResponse(
        customerValidation.errors.join(', '),
        ErrorCode.VALIDATION_ERROR
      )
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate order items
    const itemsValidation = validateOrderItems(items)
    if (!itemsValidation.valid) {
      const errorResponse = createErrorResponse(
        itemsValidation.errors.join(', '),
        ErrorCode.VALIDATION_ERROR
      )
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    if (total <= 0) {
      const errorResponse = createErrorResponse(
        'Sepet toplamı sıfır olamaz.',
        ErrorCode.VALIDATION_ERROR
      )
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Get user IP
    const userIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('x-real-ip') || 
                   '127.0.0.1'

    // Generate unique order ID (alphanumeric only - no special characters for PayTR)
    const merchantOid = `ORDER${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order in database before payment
    try {
      await createPayTROrder({
        merchantOid,
        customerName: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        totalAmount: total,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      })
    } catch (error) {
      logError('paytr-checkout', 'Order creation failed', {
        error: (error as Error).message,
        merchantOid,
      })
      const errorResponse = createErrorResponse(
        'Sipariş oluşturulamadı. Lütfen tekrar deneyin.',
        ErrorCode.GENERIC_ERROR,
        (error as Error).message
      )
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Prepare basket for PayTR (prices in kuruş)
    const userBasket = items.map(item => ({
      name: item.name,
      price: (item.price * 100).toString(), // Convert to kuruş (cents)
      quantity: item.quantity,
    }))

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get PayTR token (amount in kuruş)
    const tokenResponse = await paytr.getToken({
      merchant_oid: merchantOid,
      payment_amount: (total * 100).toString(), // Convert TRY to kuruş
      currency: 'TRY',
      email: customerInfo.email,
      user_ip: userIp,
      user_name: customerInfo.name,
      user_phone: customerInfo.phone,
      user_address: customerInfo.address,
      user_basket: userBasket,
      merchant_ok_url: `${appUrl}/success?order_id=${merchantOid}`,
      merchant_fail_url: `${appUrl}/checkout`,
    })

    // Log detailed information for debugging
    console.log('PayTR Token Request Details:', {
      merchantOid,
      total,
      totalInKurus: total * 100,
      userIp,
      appUrl,
      basketItems: userBasket.length,
      environment: process.env.NODE_ENV,
      testMode: process.env.PAYTR_TEST_MODE,
    })

    if (tokenResponse.status === 'failed') {
      logError('paytr-checkout', 'Token generation failed', {
        reason: tokenResponse.reason,
        merchantOid,
        merchantId: process.env.PAYTR_MERCHANT_ID,
        testMode: process.env.PAYTR_TEST_MODE,
      })
      
      // More specific error message based on reason
      let userMessage = 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.'
      if (tokenResponse.reason?.includes('HTTP 400')) {
        userMessage = 'Ödeme bilgileri geçersiz. Lütfen bilgilerinizi kontrol edin.'
      } else if (tokenResponse.reason?.includes('HTTP 401')) {
        userMessage = 'Ödeme sistemi kimlik doğrulama hatası. Lütfen daha sonra tekrar deneyin.'
      } else if (tokenResponse.reason?.includes('Network')) {
        userMessage = 'Ödeme sistemi bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
      }
      
      const errorResponse = createErrorResponse(
        userMessage,
        ErrorCode.PAYTR_TOKEN_ERROR,
        tokenResponse.reason
      )
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Return PayTR iframe URL
    return NextResponse.json({
      token: tokenResponse.token,
      url: `https://www.paytr.com/odeme/guvenli/${tokenResponse.token}`,
      orderId: merchantOid,
    })

  } catch (error) {
    const err = error as Error
    logError('paytr-checkout', err, {
      endpoint: '/api/checkout/paytr',
    })

    const errorResponse = createErrorResponse(
      ERROR_MESSAGES.GENERIC_ERROR,
      ErrorCode.GENERIC_ERROR,
      err.message
    )
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
