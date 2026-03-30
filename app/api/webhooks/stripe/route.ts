import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe-client'
import { createOrderFromSession, updateOrderStatus } from '@/lib/order-manager'
import { logError, createErrorResponse, ErrorCode } from '@/lib/error-handler'

/**
 * Stripe Webhook Handler
 * 
 * Processes webhook events from Stripe for payment confirmation and order management.
 * Handles checkout.session.completed, payment_intent.succeeded, and payment_intent.payment_failed events.
 * 
 * Requirements: 4.1-4.8, 5.3, 9.4, 9.5
 */
export async function POST(request: NextRequest) {
  try {
    // Get Stripe client
    const stripe = getStripeClient()
    
    // Read raw request body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      const errorResponse = createErrorResponse(
        'Missing stripe-signature header',
        ErrorCode.WEBHOOK_SIGNATURE_ERROR
      )
      logError('webhook-handler', 'Missing stripe-signature header', {
        endpoint: '/api/webhooks/stripe',
      }, 'warn')
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      const error = err as Error
      const errorResponse = createErrorResponse(
        'Invalid signature',
        ErrorCode.WEBHOOK_SIGNATURE_ERROR,
        error.message
      )
      logError('webhook-handler', error, {
        endpoint: '/api/webhooks/stripe',
        signaturePresent: !!signature,
      })
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Log event for debugging
    console.log('Webhook event received:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        try {
          // Expand line items if not already expanded
          let sessionWithItems = session
          if (!session.line_items) {
            sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ['line_items'],
            })
          }

          // Create order from session
          const order = await createOrderFromSession(sessionWithItems)
          console.log('Order created from checkout session:', {
            orderId: order.id,
            sessionId: session.id,
            totalAmount: order.totalAmount,
          })
        } catch (error) {
          const err = error as Error
          logError('webhook-handler', err, {
            endpoint: '/api/webhooks/stripe',
            eventType: 'checkout.session.completed',
            sessionId: session.id,
          })
          const errorResponse = createErrorResponse(
            'Failed to create order',
            ErrorCode.DATABASE_ERROR,
            err.message
          )
          return NextResponse.json(errorResponse, { status: 500 })
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        try {
          // Update order status to "paid"
          const order = await updateOrderStatus(paymentIntent.id, 'paid')
          console.log('Order status updated to paid:', {
            orderId: order.id,
            paymentIntentId: paymentIntent.id,
          })
        } catch (error) {
          const err = error as Error
          logError('webhook-handler', err, {
            endpoint: '/api/webhooks/stripe',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: paymentIntent.id,
          })
          const errorResponse = createErrorResponse(
            'Failed to update order status',
            ErrorCode.DATABASE_ERROR,
            err.message
          )
          return NextResponse.json(errorResponse, { status: 500 })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        try {
          // Update order status to "failed"
          const order = await updateOrderStatus(paymentIntent.id, 'failed')
          console.log('Order status updated to failed:', {
            orderId: order.id,
            paymentIntentId: paymentIntent.id,
          })
        } catch (error) {
          const err = error as Error
          logError('webhook-handler', err, {
            endpoint: '/api/webhooks/stripe',
            eventType: 'payment_intent.payment_failed',
            paymentIntentId: paymentIntent.id,
          })
          const errorResponse = createErrorResponse(
            'Failed to update order status',
            ErrorCode.DATABASE_ERROR,
            err.message
          )
          return NextResponse.json(errorResponse, { status: 500 })
        }
        break
      }

      default:
        // Log unhandled event types for debugging
        console.log('Unhandled webhook event type:', event.type)
    }

    // Return 200 status for successful processing
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    const err = error as Error
    logError('webhook-handler', err, {
      endpoint: '/api/webhooks/stripe',
    })
    const errorResponse = createErrorResponse(
      'Internal server error',
      ErrorCode.GENERIC_ERROR,
      err.message
    )
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
