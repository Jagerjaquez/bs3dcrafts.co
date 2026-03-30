import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe-client'
import { checkRateLimit } from '@/lib/rate-limiter'
import { validateCustomerData, validateOrderItems } from '@/lib/validation'
import { 
  createErrorResponse, 
  logError, 
  ErrorCode, 
  ERROR_MESSAGES,
  getStripeErrorMessage,
  isStripeError
} from '@/lib/error-handler'

// Request interface
export interface CheckoutSessionRequest {
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

// Response interfaces
export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

interface ErrorResponse {
  error: string
  details?: string
}

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      const errorResponse = createErrorResponse(
        'Stripe yapılandırması eksik. Lütfen site yöneticisi ile iletişime geçin.',
        ErrorCode.GENERIC_ERROR
      )
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Apply rate limiting
    if (!checkRateLimit(req)) {
      const errorResponse = createErrorResponse(
        ERROR_MESSAGES.RATE_LIMIT,
        ErrorCode.RATE_LIMIT
      )
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 'unknown'
      logError('checkout-api', ERROR_MESSAGES.RATE_LIMIT, {
        endpoint: '/api/checkout/session',
        ip,
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 429 })
    }

    const body: CheckoutSessionRequest = await req.json()
    const { items, customerInfo } = body

    console.log('Checkout request received:', { 
      itemCount: items?.length, 
      customerEmail: customerInfo?.email 
    })

    // Validate customer data
    const customerValidation = validateCustomerData(customerInfo)
    if (!customerValidation.valid) {
      const errorResponse = createErrorResponse(
        customerValidation.errors.join(', '),
        ErrorCode.VALIDATION_ERROR
      )
      logError('checkout-api', 'Customer validation failed', {
        endpoint: '/api/checkout/session',
        errors: customerValidation.errors,
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate order items
    const itemsValidation = validateOrderItems(items)
    if (!itemsValidation.valid) {
      const errorResponse = createErrorResponse(
        itemsValidation.errors.join(', '),
        ErrorCode.VALIDATION_ERROR
      )
      logError('checkout-api', 'Items validation failed', {
        endpoint: '/api/checkout/session',
        errors: itemsValidation.errors,
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate cart items (non-empty)
    if (!items || items.length === 0) {
      const errorResponse = createErrorResponse(
        ERROR_MESSAGES.EMPTY_CART,
        ErrorCode.EMPTY_CART
      )
      logError('checkout-api', ERROR_MESSAGES.EMPTY_CART, {
        endpoint: '/api/checkout/session',
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate customer info (all fields required)
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      const errorResponse = createErrorResponse(
        ERROR_MESSAGES.INVALID_FORM,
        ErrorCode.INVALID_FORM
      )
      logError('checkout-api', ERROR_MESSAGES.INVALID_FORM, {
        endpoint: '/api/checkout/session',
        missingFields: {
          name: !customerInfo.name,
          email: !customerInfo.email,
          phone: !customerInfo.phone,
          address: !customerInfo.address,
        },
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate cart items (positive prices and quantities)
    for (const item of items) {
      if (item.price <= 0) {
        const errorResponse = createErrorResponse(
          ERROR_MESSAGES.INVALID_PRICE,
          ErrorCode.INVALID_PRICE,
          `Item ${item.name} has invalid price: ${item.price}`
        )
        logError('checkout-api', ERROR_MESSAGES.INVALID_PRICE, {
          endpoint: '/api/checkout/session',
          itemId: item.id,
          itemName: item.name,
          price: item.price,
        }, 'warn')
        return NextResponse.json(errorResponse, { status: 400 })
      }
      if (item.quantity <= 0) {
        const errorResponse = createErrorResponse(
          'Geçersiz ürün miktarı.',
          ErrorCode.VALIDATION_ERROR,
          `Item ${item.name} has invalid quantity: ${item.quantity}`
        )
        logError('checkout-api', 'Invalid item quantity', {
          endpoint: '/api/checkout/session',
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity,
        }, 'warn')
        return NextResponse.json(errorResponse, { status: 400 })
      }
    }

    // Calculate total to ensure it's not zero
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    if (total <= 0) {
      const errorResponse = createErrorResponse(
        'Sepet toplamı sıfır olamaz.',
        ErrorCode.VALIDATION_ERROR
      )
      logError('checkout-api', 'Cart total is zero', {
        endpoint: '/api/checkout/session',
        total,
        itemCount: items.length,
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Convert prices from TRY to kuruş (multiply by 100) and create line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'try',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to kuruş
      },
      quantity: item.quantity,
    }))

    // Get app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log('Creating Stripe session with:', {
      itemCount: lineItems.length,
      total,
      appUrl
    })

    // Get Stripe client
    const stripe = getStripeClient()

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
      },
    })

    console.log('Stripe session created:', session.id)

    // Return session ID and URL
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    } as CheckoutSessionResponse)

  } catch (error) {
    const err = error as Error
    
    console.error('Checkout API error:', err)
    
    // Log error with context
    logError('checkout-api', err, {
      endpoint: '/api/checkout/session',
      errorType: err.constructor.name,
      errorMessage: err.message,
    })

    // Handle Stripe-specific errors
    if (isStripeError(error)) {
      const errorMessage = getStripeErrorMessage(error)
      console.error('Stripe error:', errorMessage)
      const errorResponse = createErrorResponse(
        errorMessage,
        ErrorCode.STRIPE_API_ERROR,
        err.message
      )
      return NextResponse.json(errorResponse, { status: 502 })
    }

    // Generic error response
    const errorResponse = createErrorResponse(
      ERROR_MESSAGES.GENERIC_ERROR,
      ErrorCode.GENERIC_ERROR,
      err.message
    )
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
