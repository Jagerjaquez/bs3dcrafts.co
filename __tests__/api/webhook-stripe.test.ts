import fc from 'fast-check'
import { POST } from '@/app/api/webhooks/stripe/route'
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

// Mock the stripe client
jest.mock('@/lib/stripe-client', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    checkout: {
      sessions: {
        retrieve: jest.fn(),
        list: jest.fn(),
      },
    },
    paymentIntents: {
      retrieve: jest.fn(),
    },
  },
}))

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  }
})

const prisma = new PrismaClient()

// Test data generators
const sessionIdArbitrary = fc.string({ minLength: 10, maxLength: 50 }).map(s => `cs_test_${s}`)
const paymentIntentIdArbitrary = fc.string({ minLength: 10, maxLength: 50 }).map(s => `pi_test_${s}`)

const lineItemArbitrary = fc.record({
  id: fc.uuid(),
  quantity: fc.integer({ min: 1, max: 10 }),
  price: fc.record({
    product: fc.uuid(),
    unit_amount: fc.integer({ min: 100, max: 1000000 }),
  }),
})

const customerInfoArbitrary = fc.record({
  customerName: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 10, maxLength: 500 }),
})

const checkoutSessionArbitrary = fc.record({
  id: sessionIdArbitrary,
  amount_total: fc.integer({ min: 100, max: 1000000 }),
  metadata: customerInfoArbitrary,
  line_items: fc.record({
    data: fc.array(lineItemArbitrary, { minLength: 1, maxLength: 5 }),
  }),
})

describe('Stripe Webhook Handler - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Property 10: Webhook Signature Verification - invalid signatures rejected with 400', async () => {
    // Feature: stripe-payment-integration, Property 10: Webhook Signature Verification
    // **Validates: Requirements 4.2, 4.3, 9.4**
    
    // This property test verifies that for any webhook request with an invalid signature,
    // the Webhook Handler SHALL reject the request and return a 400 status code.

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }), // Random invalid signature
        fc.string({ minLength: 10, maxLength: 1000 }), // Random body
        async (invalidSignature, body) => {
          jest.clearAllMocks()
          
          // Mock signature verification to throw error
          ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid signature')
          })

          const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
            method: 'POST',
            headers: {
              'stripe-signature': invalidSignature,
            },
            body,
          })

          const response = await POST(request)
          const data = await response.json()

          // Verify request is rejected with 400 status
          expect(response.status).toBe(400)
          
          // Verify error message is present
          expect(data.error).toBeDefined()
          expect(typeof data.error).toBe('string')
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 11: Webhook Success Response - valid events return 200 status', async () => {
    // Feature: stripe-payment-integration, Property 11: Webhook Success Response
    // **Validates: Requirements 4.7**
    
    // This property test verifies that for any valid webhook event that is successfully
    // processed, the Webhook Handler SHALL respond with a 200 status code.

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          jest.clearAllMocks()
          
          // Mock successful signature verification
          const mockEvent: Stripe.Event = {
            id: 'evt_test_123',
            object: 'event',
            api_version: '2024-11-20.acacia',
            created: Date.now() / 1000,
            data: {
              object: session as any,
            },
            livemode: false,
            pending_webhooks: 0,
            request: null,
            type: 'checkout.session.completed',
          }
          
          ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
          
          // Mock Prisma to return no existing order (new order)
          ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
          
          // Mock order creation
          ;(prisma.order.create as jest.Mock).mockResolvedValue({
            id: 'order_123',
            customerName: session.metadata.customerName,
            email: session.metadata.email,
            phone: session.metadata.phone,
            address: session.metadata.address,
            totalAmount: session.amount_total / 100,
            status: 'pending',
            stripePaymentId: session.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
            method: 'POST',
            headers: {
              'stripe-signature': 'valid_signature',
            },
            body: JSON.stringify(mockEvent),
          })

          const response = await POST(request)
          const data = await response.json()

          // Verify successful response with 200 status
          expect(response.status).toBe(200)
          expect(data.received).toBe(true)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 5: Order Creation from Payment Confirmation - order created from valid session', async () => {
    // Feature: stripe-payment-integration, Property 5: Order Creation from Payment Confirmation
    // **Validates: Requirements 3.1**
    
    // This property test verifies that for any valid Stripe Checkout Session data, when
    // payment is confirmed, an Order record SHALL be created in the database with all
    // session data properly mapped.

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          jest.clearAllMocks()
          
          const mockEvent: Stripe.Event = {
            id: 'evt_test_123',
            object: 'event',
            api_version: '2024-11-20.acacia',
            created: Date.now() / 1000,
            data: {
              object: session as any,
            },
            livemode: false,
            pending_webhooks: 0,
            request: null,
            type: 'checkout.session.completed',
          }
          
          ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
          ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
          
          const mockOrder = {
            id: 'order_123',
            customerName: session.metadata.customerName,
            email: session.metadata.email,
            phone: session.metadata.phone,
            address: session.metadata.address,
            totalAmount: session.amount_total / 100,
            status: 'pending',
            stripePaymentId: session.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          ;(prisma.order.create as jest.Mock).mockResolvedValue(mockOrder)

          const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
            method: 'POST',
            headers: {
              'stripe-signature': 'valid_signature',
            },
            body: JSON.stringify(mockEvent),
          })

          await POST(request)

          // Verify order was created
          expect(prisma.order.create).toHaveBeenCalledTimes(1)
          
          const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
          
          // Verify order data is properly mapped from session
          expect(createCall.data.customerName).toBe(session.metadata.customerName)
          expect(createCall.data.email).toBe(session.metadata.email)
          expect(createCall.data.phone).toBe(session.metadata.phone)
          expect(createCall.data.address).toBe(session.metadata.address)
          expect(createCall.data.totalAmount).toBe(session.amount_total / 100)
          expect(createCall.data.stripePaymentId).toBe(session.id)
          expect(createCall.data.status).toBe('pending')
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 6: Order Items Completeness - order items match session line items', async () => {
    // Feature: stripe-payment-integration, Property 6: Order Items Completeness
    // **Validates: Requirements 3.3**
    
    // This property test verifies that for any order created from a checkout session, the
    // number of OrderItem records SHALL equal the number of line items in the session, and
    // each OrderItem SHALL have matching productId, quantity, and unitPrice.

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          jest.clearAllMocks()
          
          const mockEvent: Stripe.Event = {
            id: 'evt_test_123',
            object: 'event',
            api_version: '2024-11-20.acacia',
            created: Date.now() / 1000,
            data: {
              object: session as any,
            },
            livemode: false,
            pending_webhooks: 0,
            request: null,
            type: 'checkout.session.completed',
          }
          
          ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
          ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
          ;(prisma.order.create as jest.Mock).mockResolvedValue({
            id: 'order_123',
            status: 'pending',
          })

          const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
            method: 'POST',
            headers: {
              'stripe-signature': 'valid_signature',
            },
            body: JSON.stringify(mockEvent),
          })

          await POST(request)

          const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
          const orderItems = createCall.data.items.create

          // Verify number of order items matches line items
          expect(orderItems).toHaveLength(session.line_items.data.length)

          // Verify each order item matches corresponding line item
          session.line_items.data.forEach((lineItem, index) => {
            const orderItem = orderItems[index]
            
            expect(orderItem.productId).toBe(lineItem.price.product)
            expect(orderItem.quantity).toBe(lineItem.quantity)
            expect(orderItem.unitPrice).toBe(lineItem.price.unit_amount / 100)
          })
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 7: Order Payment Reference Storage - order has stripePaymentId', async () => {
    // Feature: stripe-payment-integration, Property 7: Order Payment Reference Storage
    // **Validates: Requirements 3.4**
    
    // This property test verifies that for any order created from a checkout session, the
    // Order SHALL have a non-null stripePaymentId field that matches the Stripe session ID.

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          jest.clearAllMocks()
          
          const mockEvent: Stripe.Event = {
            id: 'evt_test_123',
            object: 'event',
            api_version: '2024-11-20.acacia',
            created: Date.now() / 1000,
            data: {
              object: session as any,
            },
            livemode: false,
            pending_webhooks: 0,
            request: null,
            type: 'checkout.session.completed',
          }
          
          ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
          ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
          ;(prisma.order.create as jest.Mock).mockResolvedValue({
            id: 'order_123',
            stripePaymentId: session.id,
          })

          const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
            method: 'POST',
            headers: {
              'stripe-signature': 'valid_signature',
            },
            body: JSON.stringify(mockEvent),
          })

          await POST(request)

          const createCall = (prisma.order.create as jest.Mock).mock.calls[0][0]
          
          // Verify stripePaymentId is set and matches session ID
          expect(createCall.data.stripePaymentId).toBeDefined()
          expect(createCall.data.stripePaymentId).not.toBeNull()
          expect(createCall.data.stripePaymentId).toBe(session.id)
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Stripe Webhook Handler - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process checkout.session.completed event successfully', async () => {
    const mockSession = {
      id: 'cs_test_123',
      amount_total: 25000,
      metadata: {
        customerName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
      },
      line_items: {
        data: [
          {
            id: 'li_1',
            quantity: 2,
            price: {
              product: 'prod_123',
              unit_amount: 10000,
            },
          },
          {
            id: 'li_2',
            quantity: 1,
            price: {
              product: 'prod_456',
              unit_amount: 5000,
            },
          },
        ],
      },
    }

    const mockEvent: Stripe.Event = {
      id: 'evt_test_123',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Date.now() / 1000,
      data: {
        object: mockSession as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'checkout.session.completed',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.order.create as jest.Mock).mockResolvedValue({
      id: 'order_123',
      customerName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      totalAmount: 250,
      status: 'pending',
      stripePaymentId: 'cs_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(prisma.order.create).toHaveBeenCalledTimes(1)
  })

  it('should process payment_intent.succeeded event successfully', async () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      amount: 25000,
      status: 'succeeded',
    }

    const mockEvent: Stripe.Event = {
      id: 'evt_test_456',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Date.now() / 1000,
      data: {
        object: mockPaymentIntent as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'payment_intent.succeeded',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
    
    // Mock finding order by payment intent
    ;(prisma.order.findFirst as jest.Mock).mockResolvedValue({
      id: 'order_123',
      status: 'pending',
    })
    
    ;(prisma.order.update as jest.Mock).mockResolvedValue({
      id: 'order_123',
      status: 'paid',
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('should process payment_intent.payment_failed event successfully', async () => {
    const mockPaymentIntent = {
      id: 'pi_test_789',
      amount: 25000,
      status: 'failed',
    }

    const mockEvent: Stripe.Event = {
      id: 'evt_test_789',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Date.now() / 1000,
      data: {
        object: mockPaymentIntent as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'payment_intent.payment_failed',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
    
    ;(prisma.order.findFirst as jest.Mock).mockResolvedValue({
      id: 'order_123',
      status: 'pending',
    })
    
    ;(prisma.order.update as jest.Mock).mockResolvedValue({
      id: 'order_123',
      status: 'failed',
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('should reject request with missing signature', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing stripe-signature header')
  })

  it('should reject request with invalid signature', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'invalid_signature',
      },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
  })

  it('should return 500 when order creation fails', async () => {
    const mockSession = {
      id: 'cs_test_123',
      amount_total: 25000,
      metadata: {
        customerName: 'John Doe',
        email: 'john@example.com',
      },
      line_items: {
        data: [],
      },
    }

    const mockEvent: Stripe.Event = {
      id: 'evt_test_123',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Date.now() / 1000,
      data: {
        object: mockSession as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'checkout.session.completed',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.order.create as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create order')
  })

  it('should handle unhandled event types gracefully', async () => {
    const mockEvent: Stripe.Event = {
      id: 'evt_test_999',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Date.now() / 1000,
      data: {
        object: {} as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'customer.created' as any,
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
  })

  it('should handle idempotency - return success for duplicate session', async () => {
    const mockSession = {
      id: 'cs_test_123',
      amount_total: 25000,
      metadata: {
        customerName: 'John Doe',
        email: 'john@example.com',
      },
      line_items: {
        data: [
          {
            id: 'li_1',
            quantity: 1,
            price: {
              product: 'prod_123',
              unit_amount: 25000,
            },
          },
        ],
      },
    }

    const mockEvent: Stripe.Event = {
      id: 'evt_test_123',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Date.now() / 1000,
      data: {
        object: mockSession as any,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      type: 'checkout.session.completed',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
    
    // Mock existing order (idempotency check)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'order_123',
      stripePaymentId: 'cs_test_123',
      status: 'pending',
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'valid_signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    
    // Verify order.create was NOT called (idempotency)
    expect(prisma.order.create).not.toHaveBeenCalled()
  })
})
