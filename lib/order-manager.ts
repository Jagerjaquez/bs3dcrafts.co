import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { getStripeClient } from './stripe-client'
import { sendOrderEmails } from './email-service'

const prisma = new PrismaClient()

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'failed'

// Valid order status values
const VALID_ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'completed', 'failed']

/**
 * Validates if a status value is a valid OrderStatus
 * @param status - Status value to validate
 * @returns true if valid, false otherwise
 */
export function isValidOrderStatus(status: string): status is OrderStatus {
  return VALID_ORDER_STATUSES.includes(status as OrderStatus)
}

/**
 * Validates and throws error if status is invalid
 * @param status - Status value to validate
 * @throws Error if status is invalid
 */
function validateOrderStatus(status: string): asserts status is OrderStatus {
  if (!isValidOrderStatus(status)) {
    throw new Error(
      `Invalid order status: ${status}. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
    )
  }
}

export interface Order {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  totalAmount: number
  status: string
  stripePaymentId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderManager {
  createOrderFromSession(session: Stripe.Checkout.Session): Promise<Order>
  updateOrderStatus(paymentIntentId: string, status: OrderStatus): Promise<Order>
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null>
}

/**
 * Creates an order from a Stripe Checkout Session
 * Implements idempotency using stripePaymentId to prevent duplicate orders
 * 
 * @param session - Stripe Checkout Session object
 * @returns Created or existing Order
 * @throws Error if session data is invalid or database operation fails
 */
export async function createOrderFromSession(
  session: Stripe.Checkout.Session
): Promise<Order> {
  // Idempotency check: return existing order if already created
  const existingOrder = await prisma.order.findUnique({
    where: { stripePaymentId: session.id },
  })

  if (existingOrder) {
    return existingOrder
  }

  // Extract customer info from session metadata
  const metadata = session.metadata || {}
  const customerName = metadata.customerName || ''
  const email = metadata.email || session.customer_details?.email || ''
  const phone = metadata.phone || session.customer_details?.phone || ''
  const address = metadata.address || ''

  // Retrieve line items from the session
  // Note: Line items need to be expanded when creating the session
  const lineItems = session.line_items?.data || []

  if (lineItems.length === 0) {
    throw new Error('No line items found in checkout session')
  }

  // Calculate total amount from line items (convert from cents to currency units)
  const totalAmount = (session.amount_total || 0) / 100

  // Create order with items in a transaction
  const order = await prisma.order.create({
    data: {
      customerName,
      email,
      phone,
      address,
      totalAmount,
      status: 'pending',
      stripePaymentId: session.id,
      items: {
        create: lineItems.map((item) => ({
          productId: item.price?.product as string,
          quantity: item.quantity || 1,
          unitPrice: (item.price?.unit_amount || 0) / 100,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  // Send order confirmation emails (non-blocking)
  sendOrderEmails({
    orderNumber: `#${order.id.slice(0, 8).toUpperCase()}`,
    orderDate: order.createdAt,
    customerName: order.customerName,
    customerEmail: order.email,
    customerPhone: order.phone,
    items: order.items.map((item) => ({
      name: item.productId, // TODO: Fetch actual product name
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    subtotal: totalAmount,
    shipping: 0, // TODO: Calculate shipping
    total: totalAmount,
    paymentMethod: 'Stripe',
    shippingAddress: {
      line1: order.address,
      city: '',
      state: '',
      postalCode: '',
      country: 'Turkey',
    },
  }).catch((error) => {
    console.error('Failed to send order emails:', error)
    // Don't throw error - email failure shouldn't fail order creation
  })

  return order
}

/**
 * Updates an order's status by payment intent ID
 * 
 * This method handles payment intent IDs by looking up the associated checkout session
 * from Stripe, then finding the order by session ID.
 * Validates status values and updates the updatedAt timestamp.
 * 
 * @param paymentIntentId - Stripe Payment Intent ID
 * @param status - New order status (must be one of: pending, paid, shipped, completed, failed)
 * @returns Updated Order
 * @throws Error if order not found, status is invalid, or update fails
 */
export async function updateOrderStatus(
  paymentIntentId: string,
  status: OrderStatus
): Promise<Order> {
  // Validate status value
  validateOrderStatus(status)

  let order: Order | null = null

  // First, try to find order directly by stripePaymentId (in case it's a session ID)
  order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  })

  // If not found, assume it's a payment intent ID and look up the session
  if (!order) {
    try {
      // Get Stripe client
      const stripe = getStripeClient()
      
      // Retrieve the payment intent from Stripe to get the associated session
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      // Get the session ID from the payment intent metadata or by listing sessions
      // Payment intents created by Checkout Sessions don't directly reference the session
      // We need to search for sessions with this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      })

      if (sessions.data.length > 0) {
        const sessionId = sessions.data[0].id
        order = await prisma.order.findFirst({
          where: { stripePaymentId: sessionId },
        })
      }
    } catch (error) {
      throw new Error(`Failed to look up session for payment intent ${paymentIntentId}: ${error}`)
    }
  }

  if (!order) {
    throw new Error(`Order not found for payment intent: ${paymentIntentId}`)
  }

  // Update order status and updatedAt timestamp (Prisma handles updatedAt automatically)
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status },
  })

  return updatedOrder
}

/**
 * Retrieves an order by payment intent ID or session ID
 * 
 * This method handles both session IDs and payment intent IDs by first trying
 * a direct lookup, then querying Stripe if needed.
 * 
 * @param paymentIntentId - Stripe Payment Intent ID or Session ID
 * @returns Order if found, null otherwise
 */
export async function getOrderByPaymentIntent(
  paymentIntentId: string
): Promise<Order | null> {
  // First, try direct lookup by stripePaymentId
  let order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  })

  // If not found, assume it's a payment intent ID and look up the session
  if (!order) {
    try {
      // Get Stripe client
      const stripe = getStripeClient()
      
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      })

      if (sessions.data.length > 0) {
        const sessionId = sessions.data[0].id
        order = await prisma.order.findFirst({
          where: { stripePaymentId: sessionId },
        })
      }
    } catch (error) {
      // If Stripe API call fails, return null (order not found)
      return null
    }
  }

  return order
}

// Export as default object implementing OrderManager interface
const orderManager: OrderManager = {
  createOrderFromSession,
  updateOrderStatus,
  getOrderByPaymentIntent,
}

export default orderManager
