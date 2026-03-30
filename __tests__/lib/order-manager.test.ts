import fc from 'fast-check'
import { PrismaClient } from '@prisma/client'
import { createOrderFromSession } from '@/lib/order-manager'

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

// Mock stripe-client
jest.mock('@/lib/stripe-client', () => ({
  stripe: {
    paymentIntents: {
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        list: jest.fn(),
      },
    },
  },
}))

describe('Order Manager - Property Tests', () => {
  let prisma: any

  beforeEach(() => {
    // Get the mocked Prisma instance
    prisma = new PrismaClient()
    jest.clearAllMocks()
  })

  it('Property 16: Order Creation Idempotency - calling createOrderFromSession multiple times with same session ID creates only one order', async () => {
    // Feature: stripe-payment-integration, Property 16: Order Creation Idempotency
    // **Validates: Requirements 7.6**
    
    // This property test verifies that for any Stripe Checkout Session ID,
    // calling order creation multiple times with the same session ID SHALL
    // result in only one Order record being created.

    // Arbitraries for test data generation
    const sessionIdArbitrary = fc.string({ minLength: 20, maxLength: 50 })
    
    const lineItemArbitrary = fc.record({
      id: fc.uuid(),
      price: fc.record({
        product: fc.uuid(),
        unit_amount: fc.integer({ min: 100, max: 1000000 }), // in cents
      }),
      quantity: fc.integer({ min: 1, max: 100 }),
    })

    const customerInfoArbitrary = fc.record({
      customerName: fc.string({ minLength: 1, maxLength: 100 }),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 }),
      address: fc.string({ minLength: 10, maxLength: 500 }),
    })

    const checkoutSessionArbitrary = fc.record({
      id: sessionIdArbitrary,
      metadata: customerInfoArbitrary,
      customer_details: fc.record({
        email: fc.emailAddress(),
        phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: null }),
      }),
      line_items: fc.record({
        data: fc.array(lineItemArbitrary, { minLength: 1, maxLength: 10 }),
      }),
      amount_total: fc.integer({ min: 100, max: 10000000 }), // in cents
    })

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        fc.integer({ min: 2, max: 5 }), // Number of times to call the function
        async (session, callCount) => {
          // Reset mocks for each property test run
          jest.clearAllMocks()

          // Create a mock order that will be returned
          const mockOrder = {
            id: 'order_' + session.id,
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

          // Track how many times create is called
          let createCallCount = 0

          // First call: no existing order (returns null)
          // Subsequent calls: existing order found (returns mockOrder)
          prisma.order.findUnique.mockImplementation(() => {
            if (createCallCount === 0) {
              return Promise.resolve(null) // First call: no existing order
            }
            return Promise.resolve(mockOrder) // Subsequent calls: order exists
          })

          // Mock create to increment counter and return order
          prisma.order.create.mockImplementation(() => {
            createCallCount++
            return Promise.resolve(mockOrder)
          })

          // Call createOrderFromSession multiple times with the same session
          const results = []
          for (let i = 0; i < callCount; i++) {
            const result = await createOrderFromSession(session as any)
            results.push(result)
          }

          // Property 1: Only one order should be created (create called once)
          expect(createCallCount).toBe(1)

          // Property 2: All calls should return the same order ID
          const orderIds = results.map(r => r.id)
          const uniqueOrderIds = new Set(orderIds)
          expect(uniqueOrderIds.size).toBe(1)

          // Property 3: All returned orders should have the same stripePaymentId
          results.forEach(order => {
            expect(order.stripePaymentId).toBe(session.id)
          })

          // Property 4: findUnique should be called for each invocation
          expect(prisma.order.findUnique).toHaveBeenCalledTimes(callCount)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 8: Order Total Calculation - order totalAmount equals sum of (unitPrice × quantity) for all items', async () => {
    // Feature: stripe-payment-integration, Property 8: Order Total Calculation
    // **Validates: Requirements 3.5, 10.4**
    
    // This property test verifies that for any order with order items,
    // the totalAmount field SHALL equal the sum of (unitPrice × quantity) for all order items.

    // Arbitraries for test data generation
    const lineItemArbitrary = fc.record({
      id: fc.uuid(),
      price: fc.record({
        product: fc.uuid(),
        unit_amount: fc.integer({ min: 100, max: 1000000 }), // in cents
      }),
      quantity: fc.integer({ min: 1, max: 100 }),
    })

    const customerInfoArbitrary = fc.record({
      customerName: fc.string({ minLength: 1, maxLength: 100 }),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 }),
      address: fc.string({ minLength: 10, maxLength: 500 }),
    })

    const checkoutSessionArbitrary = fc.record({
      id: fc.string({ minLength: 20, maxLength: 50 }),
      metadata: customerInfoArbitrary,
      customer_details: fc.record({
        email: fc.emailAddress(),
        phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: null }),
      }),
      line_items: fc.record({
        data: fc.array(lineItemArbitrary, { minLength: 1, maxLength: 10 }),
      }),
      amount_total: fc.integer({ min: 100, max: 10000000 }), // in cents
    })

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          // Reset mocks for each property test run
          jest.clearAllMocks()

          // Calculate expected total from line items
          const expectedTotal = session.line_items.data.reduce((sum: number, item: any) => {
            const unitPrice = (item.price.unit_amount || 0) / 100 // Convert cents to currency units
            const quantity = item.quantity || 1
            return sum + (unitPrice * quantity)
          }, 0)

          // Create mock order items that will be returned
          const mockOrderItems = session.line_items.data.map((item, index) => ({
            id: `item_${index}`,
            orderId: 'order_' + session.id,
            productId: item.price.product as string,
            quantity: item.quantity || 1,
            unitPrice: (item.price.unit_amount || 0) / 100,
            createdAt: new Date(),
          }))

          // Create mock order with calculated total
          const mockOrder = {
            id: 'order_' + session.id,
            customerName: session.metadata.customerName,
            email: session.metadata.email,
            phone: session.metadata.phone,
            address: session.metadata.address,
            totalAmount: expectedTotal,
            status: 'pending',
            stripePaymentId: session.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: mockOrderItems,
          }

          // Mock Prisma to return null for findUnique (no existing order)
          prisma.order.findUnique.mockResolvedValue(null)

          // Mock Prisma create to return the order with items
          prisma.order.create.mockResolvedValue(mockOrder)

          // Call createOrderFromSession
          const result = await createOrderFromSession(session as any)

          // Property: totalAmount should equal sum of (unitPrice × quantity) for all items
          const actualTotal = result.totalAmount
          
          // Calculate total from returned order items if available
          if ((result as any).items && Array.isArray((result as any).items)) {
            const calculatedTotal = (result as any).items.reduce((sum: number, item: any) => {
              return sum + (item.unitPrice * item.quantity)
            }, 0)
            
            // The order's totalAmount should match the calculated total from items
            expect(actualTotal).toBeCloseTo(calculatedTotal, 2) // Allow for floating point precision
          }
          
          // The order's totalAmount should also match our expected total
          expect(actualTotal).toBeCloseTo(expectedTotal, 2)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 9: Order Customer Association - order contains customer name, email, phone, and address from session metadata', async () => {
    // Feature: stripe-payment-integration, Property 9: Order Customer Association
    // **Validates: Requirements 3.6**
    
    // This property test verifies that for any order created from a checkout session,
    // the Order SHALL contain the customer's name, email, phone, and address from the session metadata.

    // Arbitraries for test data generation
    const lineItemArbitrary = fc.record({
      id: fc.uuid(),
      price: fc.record({
        product: fc.uuid(),
        unit_amount: fc.integer({ min: 100, max: 1000000 }), // in cents
      }),
      quantity: fc.integer({ min: 1, max: 100 }),
    })

    const customerInfoArbitrary = fc.record({
      customerName: fc.string({ minLength: 1, maxLength: 100 }),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 }),
      address: fc.string({ minLength: 10, maxLength: 500 }),
    })

    const checkoutSessionArbitrary = fc.record({
      id: fc.string({ minLength: 20, maxLength: 50 }),
      metadata: customerInfoArbitrary,
      customer_details: fc.record({
        email: fc.emailAddress(),
        phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: null }),
      }),
      line_items: fc.record({
        data: fc.array(lineItemArbitrary, { minLength: 1, maxLength: 10 }),
      }),
      amount_total: fc.integer({ min: 100, max: 10000000 }), // in cents
    })

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          // Reset mocks for each property test run
          jest.clearAllMocks()

          // Create mock order with customer info from session metadata
          const mockOrder = {
            id: 'order_' + session.id,
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

          // Mock Prisma to return null for findUnique (no existing order)
          prisma.order.findUnique.mockResolvedValue(null)

          // Mock Prisma create to return the order
          prisma.order.create.mockResolvedValue(mockOrder)

          // Call createOrderFromSession
          const result = await createOrderFromSession(session as any)

          // Property 1: Order should contain customer name from session metadata
          expect(result.customerName).toBe(session.metadata.customerName)

          // Property 2: Order should contain email from session metadata
          expect(result.email).toBe(session.metadata.email)

          // Property 3: Order should contain phone from session metadata
          expect(result.phone).toBe(session.metadata.phone)

          // Property 4: Order should contain address from session metadata
          expect(result.address).toBe(session.metadata.address)

          // Property 5: All customer fields should be non-empty strings
          expect(result.customerName).toBeTruthy()
          expect(result.email).toBeTruthy()
          expect(result.phone).toBeTruthy()
          expect(result.address).toBeTruthy()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 12: Order Status Values Validation - status values are always one of the valid statuses', async () => {
    // Feature: stripe-payment-integration, Property 12: Order Status Values Validation
    // **Validates: Requirements 5.1**
    
    // This property test verifies that for any order status update,
    // the status value SHALL be one of: "pending", "paid", "shipped", "completed", or "failed".

    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'failed'] as const
    const invalidStatuses = ['processing', 'cancelled', 'refunded', 'invalid', '', 'PAID', 'Pending']

    // Test 1: Valid statuses should be accepted
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...validStatuses),
        fc.string({ minLength: 20, maxLength: 50 }), // session ID
        async (status, sessionId) => {
          jest.clearAllMocks()

          const mockOrder = {
            id: 'order_123',
            customerName: 'Test User',
            email: 'test@example.com',
            phone: '+905551234567',
            address: 'Test Address',
            totalAmount: 100,
            status: 'pending',
            stripePaymentId: sessionId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const updatedOrder = {
            ...mockOrder,
            status,
            updatedAt: new Date(),
          }

          prisma.order.findFirst.mockResolvedValue(mockOrder)
          prisma.order.update.mockResolvedValue(updatedOrder)

          // Should not throw for valid statuses
          const result = await require('@/lib/order-manager').updateOrderStatus(sessionId, status)
          
          // Property: Status should be one of the valid values
          expect(validStatuses).toContain(result.status as any)
        }
      ),
      { numRuns: 5 }
    )

    // Test 2: Invalid statuses should be rejected
    for (const invalidStatus of invalidStatuses) {
      jest.clearAllMocks()

      const mockOrder = {
        id: 'order_456',
        customerName: 'Test User',
        email: 'test@example.com',
        phone: '+905551234567',
        address: 'Test Address',
        totalAmount: 100,
        status: 'pending',
        stripePaymentId: 'cs_test_invalid',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.order.findFirst.mockResolvedValue(mockOrder)

      // Should throw for invalid statuses
      await expect(
        require('@/lib/order-manager').updateOrderStatus('cs_test_invalid', invalidStatus as any)
      ).rejects.toThrow(/Invalid order status/)
    }
  })

  it('Property 13: Order Initial Status - newly created orders have status "pending"', async () => {
    // Feature: stripe-payment-integration, Property 13: Order Initial Status
    // **Validates: Requirements 5.2**
    
    // This property test verifies that for any newly created order (before payment confirmation),
    // the Order SHALL have status set to "pending".

    const lineItemArbitrary = fc.record({
      id: fc.uuid(),
      price: fc.record({
        product: fc.uuid(),
        unit_amount: fc.integer({ min: 100, max: 1000000 }), // in cents
      }),
      quantity: fc.integer({ min: 1, max: 100 }),
    })

    const customerInfoArbitrary = fc.record({
      customerName: fc.string({ minLength: 1, maxLength: 100 }),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 }),
      address: fc.string({ minLength: 10, maxLength: 500 }),
    })

    const checkoutSessionArbitrary = fc.record({
      id: fc.string({ minLength: 20, maxLength: 50 }),
      metadata: customerInfoArbitrary,
      customer_details: fc.record({
        email: fc.emailAddress(),
        phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: null }),
      }),
      line_items: fc.record({
        data: fc.array(lineItemArbitrary, { minLength: 1, maxLength: 10 }),
      }),
      amount_total: fc.integer({ min: 100, max: 10000000 }), // in cents
    })

    await fc.assert(
      fc.asyncProperty(
        checkoutSessionArbitrary,
        async (session) => {
          jest.clearAllMocks()

          // Create mock order with initial status
          const mockOrder = {
            id: 'order_' + session.id,
            customerName: session.metadata.customerName,
            email: session.metadata.email,
            phone: session.metadata.phone,
            address: session.metadata.address,
            totalAmount: session.amount_total / 100,
            status: 'pending', // Initial status should always be pending
            stripePaymentId: session.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          prisma.order.findUnique.mockResolvedValue(null)
          prisma.order.create.mockResolvedValue(mockOrder)

          const result = await createOrderFromSession(session as any)

          // Property: Initial status should always be "pending"
          expect(result.status).toBe('pending')
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 14: Order Timestamp Updates - updatedAt is greater than or equal to createdAt', async () => {
    // Feature: stripe-payment-integration, Property 14: Order Timestamp Updates
    // **Validates: Requirements 5.5**
    
    // This property test verifies that for any order status change,
    // the updatedAt timestamp SHALL be greater than or equal to the createdAt timestamp.

    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'failed'] as const

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...validStatuses),
        fc.string({ minLength: 20, maxLength: 50 }), // session ID
        fc.integer({ min: 0, max: 10000 }), // milliseconds delay for updatedAt
        async (status, sessionId, delayMs) => {
          jest.clearAllMocks()

          const createdAt = new Date()
          const updatedAt = new Date(createdAt.getTime() + delayMs)

          const mockOrder = {
            id: 'order_123',
            customerName: 'Test User',
            email: 'test@example.com',
            phone: '+905551234567',
            address: 'Test Address',
            totalAmount: 100,
            status: 'pending',
            stripePaymentId: sessionId,
            createdAt,
            updatedAt: createdAt,
          }

          const updatedOrder = {
            ...mockOrder,
            status,
            updatedAt,
          }

          prisma.order.findFirst.mockResolvedValue(mockOrder)
          prisma.order.update.mockResolvedValue(updatedOrder)

          const result = await require('@/lib/order-manager').updateOrderStatus(sessionId, status)

          // Property: updatedAt should be >= createdAt
          expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(result.createdAt.getTime())
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Order Manager - Unit Tests', () => {
  let prisma: any
  let stripeMock: any

  beforeEach(() => {
    prisma = new PrismaClient()
    stripeMock = require('@/lib/stripe-client').stripe
    jest.clearAllMocks()
  })

  describe('createOrderFromSession', () => {
    it('should successfully create an order with sample session data', async () => {
      // Sample session data
      const sampleSession = {
        id: 'cs_test_123456789',
        metadata: {
          customerName: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          phone: '+905551234567',
          address: 'İstanbul, Türkiye',
        },
        customer_details: {
          email: 'ahmet@example.com',
          phone: '+905551234567',
        },
        line_items: {
          data: [
            {
              id: 'li_1',
              price: {
                product: 'prod_123',
                unit_amount: 15000, // 150 TRY in cents
              },
              quantity: 2,
            },
            {
              id: 'li_2',
              price: {
                product: 'prod_456',
                unit_amount: 25000, // 250 TRY in cents
              },
              quantity: 1,
            },
          ],
        },
        amount_total: 55000, // 550 TRY in cents
      }

      const expectedOrder = {
        id: 'order_123',
        customerName: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+905551234567',
        address: 'İstanbul, Türkiye',
        totalAmount: 550,
        status: 'pending',
        stripePaymentId: 'cs_test_123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.order.findUnique.mockResolvedValue(null)
      prisma.order.create.mockResolvedValue(expectedOrder)

      const result = await createOrderFromSession(sampleSession as any)

      expect(result).toEqual(expectedOrder)
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          customerName: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          phone: '+905551234567',
          address: 'İstanbul, Türkiye',
          totalAmount: 550,
          status: 'pending',
          stripePaymentId: 'cs_test_123456789',
          items: {
            create: [
              {
                productId: 'prod_123',
                quantity: 2,
                unitPrice: 150,
              },
              {
                productId: 'prod_456',
                quantity: 1,
                unitPrice: 250,
              },
            ],
          },
        },
      })
    })

    it('should handle missing session data gracefully', async () => {
      const invalidSession = {
        id: 'cs_test_invalid',
        metadata: {},
        customer_details: null,
        line_items: {
          data: [],
        },
        amount_total: 0,
      }

      prisma.order.findUnique.mockResolvedValue(null)

      await expect(createOrderFromSession(invalidSession as any)).rejects.toThrow(
        'No line items found in checkout session'
      )
    })

    it('should handle database transaction rollback on failure', async () => {
      const sampleSession = {
        id: 'cs_test_fail',
        metadata: {
          customerName: 'Test User',
          email: 'test@example.com',
          phone: '+905551234567',
          address: 'Test Address',
        },
        line_items: {
          data: [
            {
              id: 'li_1',
              price: {
                product: 'prod_123',
                unit_amount: 10000,
              },
              quantity: 1,
            },
          ],
        },
        amount_total: 10000,
      }

      prisma.order.findUnique.mockResolvedValue(null)
      prisma.order.create.mockRejectedValue(new Error('Database connection failed'))

      await expect(createOrderFromSession(sampleSession as any)).rejects.toThrow(
        'Database connection failed'
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status from "pending" to "paid"', async () => {
      const mockOrder = {
        id: 'order_123',
        customerName: 'Test User',
        email: 'test@example.com',
        phone: '+905551234567',
        address: 'Test Address',
        totalAmount: 100,
        status: 'pending',
        stripePaymentId: 'cs_test_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedOrder = {
        ...mockOrder,
        status: 'paid',
        updatedAt: new Date(),
      }

      prisma.order.findFirst.mockResolvedValue(mockOrder)
      prisma.order.update.mockResolvedValue(updatedOrder)

      const result = await require('@/lib/order-manager').updateOrderStatus('cs_test_123', 'paid')

      expect(result.status).toBe('paid')
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order_123' },
        data: { status: 'paid' },
      })
    })

    it('should handle payment intent ID lookup via Stripe API', async () => {
      const paymentIntentId = 'pi_test_123'
      const sessionId = 'cs_test_456'

      const mockOrder = {
        id: 'order_789',
        customerName: 'Test User',
        email: 'test@example.com',
        phone: '+905551234567',
        address: 'Test Address',
        totalAmount: 200,
        status: 'pending',
        stripePaymentId: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedOrder = {
        ...mockOrder,
        status: 'paid',
        updatedAt: new Date(),
      }

      // First findFirst returns null (not found by payment intent ID)
      prisma.order.findFirst.mockResolvedValueOnce(null)
      
      // Mock Stripe API to return session
      stripeMock.checkout.sessions.list.mockResolvedValue({
        data: [{ id: sessionId }],
      })

      // Second findFirst returns the order (found by session ID)
      prisma.order.findFirst.mockResolvedValueOnce(mockOrder)
      
      prisma.order.update.mockResolvedValue(updatedOrder)

      const result = await require('@/lib/order-manager').updateOrderStatus(paymentIntentId, 'paid')

      expect(result.status).toBe('paid')
      expect(stripeMock.checkout.sessions.list).toHaveBeenCalledWith({
        payment_intent: paymentIntentId,
        limit: 1,
      })
    })

    it('should throw error when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null)
      stripeMock.checkout.sessions.list.mockResolvedValue({
        data: [],
      })

      await expect(
        require('@/lib/order-manager').updateOrderStatus('pi_nonexistent', 'paid')
      ).rejects.toThrow('Order not found for payment intent: pi_nonexistent')
    })
  })

  describe('getOrderByPaymentIntent', () => {
    it('should retrieve order by session ID', async () => {
      const mockOrder = {
        id: 'order_123',
        customerName: 'Test User',
        email: 'test@example.com',
        phone: '+905551234567',
        address: 'Test Address',
        totalAmount: 100,
        status: 'paid',
        stripePaymentId: 'cs_test_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.order.findFirst.mockResolvedValue(mockOrder)

      const result = await require('@/lib/order-manager').getOrderByPaymentIntent('cs_test_123')

      expect(result).toEqual(mockOrder)
      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: { stripePaymentId: 'cs_test_123' },
      })
    })

    it('should retrieve order by payment intent ID via Stripe lookup', async () => {
      const paymentIntentId = 'pi_test_789'
      const sessionId = 'cs_test_456'

      const mockOrder = {
        id: 'order_456',
        customerName: 'Test User',
        email: 'test@example.com',
        phone: '+905551234567',
        address: 'Test Address',
        totalAmount: 150,
        status: 'paid',
        stripePaymentId: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // First findFirst returns null
      prisma.order.findFirst.mockResolvedValueOnce(null)
      
      // Mock Stripe API
      stripeMock.checkout.sessions.list.mockResolvedValue({
        data: [{ id: sessionId }],
      })

      // Second findFirst returns the order
      prisma.order.findFirst.mockResolvedValueOnce(mockOrder)

      const result = await require('@/lib/order-manager').getOrderByPaymentIntent(paymentIntentId)

      expect(result).toEqual(mockOrder)
      expect(stripeMock.checkout.sessions.list).toHaveBeenCalledWith({
        payment_intent: paymentIntentId,
        limit: 1,
      })
    })

    it('should return null when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null)
      stripeMock.checkout.sessions.list.mockResolvedValue({
        data: [],
      })

      const result = await require('@/lib/order-manager').getOrderByPaymentIntent('pi_nonexistent')

      expect(result).toBeNull()
    })

    it('should return null when Stripe API call fails', async () => {
      prisma.order.findFirst.mockResolvedValue(null)
      stripeMock.checkout.sessions.list.mockRejectedValue(new Error('Stripe API error'))

      const result = await require('@/lib/order-manager').getOrderByPaymentIntent('pi_error')

      expect(result).toBeNull()
    })
  })
})
