import fc from 'fast-check'
import { POST } from '@/app/api/checkout/session/route'
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe-client'

// Mock the stripe client
jest.mock('@/lib/stripe-client', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

// Mock the rate limiter to always allow requests in tests
jest.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}))

// Shared arbitraries for test data generation
const cartItemArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
  quantity: fc.integer({ min: 1, max: 100 }),
})

const customerInfoArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 10, maxLength: 500 }),
})

describe('Checkout Session API - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Property 2: Checkout Session Line Items Completeness - session line items match all cart items', async () => {
    // Feature: stripe-payment-integration, Property 2: Checkout Session Line Items Completeness
    // **Validates: Requirements 1.3**
    
    // This property test verifies that for any set of cart items, when creating a Stripe
    // Checkout Session, the session SHALL contain line items matching all cart items with
    // their names, quantities, and prices.

    await fc.assert(
      fc.asyncProperty(
        fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
        customerInfoArbitrary,
        async (cartItems, customerInfo) => {
          // Clear mock before each iteration
          jest.clearAllMocks()
          
          // Mock the Stripe session creation to return a session with ID and URL
          ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            id: 'cs_test_mock',
            url: 'https://checkout.stripe.com/mock',
          })

          // Create the request
          const request = new NextRequest('http://localhost:3000/api/checkout/session', {
            method: 'POST',
            body: JSON.stringify({
              items: cartItems,
              customerInfo,
            }),
          })

          // Call the API route
          const response = await POST(request)
          const data = await response.json()

          // Verify the response is successful
          expect(response.status).toBe(200)
          expect(data.sessionId).toBe('cs_test_mock')

          // Get the arguments passed to stripe.checkout.sessions.create
          const createCall = (stripe.checkout.sessions.create as jest.Mock).mock.calls[0][0]
          const lineItems = createCall.line_items

          // Property 1: Number of line items must match number of cart items
          expect(lineItems).toHaveLength(cartItems.length)

          // Property 2: Each line item must match the corresponding cart item
          cartItems.forEach((cartItem, index) => {
            const lineItem = lineItems[index]
            
            // Verify name matches
            expect(lineItem.price_data.product_data.name).toBe(cartItem.name)
            
            // Verify quantity matches
            expect(lineItem.quantity).toBe(cartItem.quantity)
            
            // Verify price matches (converted to kuruş)
            const expectedAmount = Math.round(cartItem.price * 100)
            expect(lineItem.price_data.unit_amount).toBe(expectedAmount)
            
            // Verify currency is TRY
            expect(lineItem.price_data.currency).toBe('try')
          })
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 3: Checkout Session URL Configuration - session has success and cancel URLs', async () => {
    // Feature: stripe-payment-integration, Property 3: Checkout Session URL Configuration
    // **Validates: Requirements 1.4**
    
    // This property test verifies that for any Checkout Session creation, the session SHALL
    // have non-empty success_url and cancel_url fields configured for post-payment redirection.

    await fc.assert(
      fc.asyncProperty(
        fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
        customerInfoArbitrary,
        async (cartItems, customerInfo) => {
          jest.clearAllMocks()
          
          ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            id: 'cs_test_mock',
            url: 'https://checkout.stripe.com/mock',
          })

          const request = new NextRequest('http://localhost:3000/api/checkout/session', {
            method: 'POST',
            body: JSON.stringify({
              items: cartItems,
              customerInfo,
            }),
          })

          await POST(request)

          // Get the arguments passed to stripe.checkout.sessions.create
          const createCall = (stripe.checkout.sessions.create as jest.Mock).mock.calls[0][0]

          // Verify success_url is configured and non-empty
          expect(createCall.success_url).toBeDefined()
          expect(createCall.success_url).not.toBe('')
          expect(typeof createCall.success_url).toBe('string')
          expect(createCall.success_url.length).toBeGreaterThan(0)

          // Verify cancel_url is configured and non-empty
          expect(createCall.cancel_url).toBeDefined()
          expect(createCall.cancel_url).not.toBe('')
          expect(typeof createCall.cancel_url).toBe('string')
          expect(createCall.cancel_url.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 4: Checkout Session URL Response - API returns valid URL', async () => {
    // Feature: stripe-payment-integration, Property 4: Checkout Session URL Response
    // **Validates: Requirements 1.5**
    
    // This property test verifies that for any successful Checkout Session creation, the API
    // response SHALL contain a valid URL that can be used for redirecting to the Stripe-hosted
    // payment page.

    await fc.assert(
      fc.asyncProperty(
        fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
        customerInfoArbitrary,
        async (cartItems, customerInfo) => {
          jest.clearAllMocks()
          
          ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            id: 'cs_test_mock',
            url: 'https://checkout.stripe.com/mock',
          })

          const request = new NextRequest('http://localhost:3000/api/checkout/session', {
            method: 'POST',
            body: JSON.stringify({
              items: cartItems,
              customerInfo,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          // Verify response is successful
          expect(response.status).toBe(200)

          // Verify URL is present and valid
          expect(data.url).toBeDefined()
          expect(typeof data.url).toBe('string')
          expect(data.url.length).toBeGreaterThan(0)
          
          // Verify URL is a valid URL format
          expect(() => new URL(data.url)).not.toThrow()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 20: Price Format Conversion - prices converted to kuruş', async () => {
    // Feature: stripe-payment-integration, Property 20: Price Format Conversion
    // **Validates: Requirements 10.2**
    
    // This property test verifies that for any cart item price in TRY, when creating a
    // Checkout Session, the price SHALL be converted to an integer representing kuruş
    // (multiplied by 100).

    await fc.assert(
      fc.asyncProperty(
        fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
        customerInfoArbitrary,
        async (cartItems, customerInfo) => {
          jest.clearAllMocks()
          
          ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
            id: 'cs_test_mock',
            url: 'https://checkout.stripe.com/mock',
          })

          const request = new NextRequest('http://localhost:3000/api/checkout/session', {
            method: 'POST',
            body: JSON.stringify({
              items: cartItems,
              customerInfo,
            }),
          })

          await POST(request)

          // Get the arguments passed to stripe.checkout.sessions.create
          const createCall = (stripe.checkout.sessions.create as jest.Mock).mock.calls[0][0]
          const lineItems = createCall.line_items

          // Verify each line item has price converted to kuruş
          cartItems.forEach((cartItem, index) => {
            const lineItem = lineItems[index]
            const unitAmount = lineItem.price_data.unit_amount
            
            // Verify unit_amount is an integer
            expect(Number.isInteger(unitAmount)).toBe(true)
            
            // Verify unit_amount equals price * 100 (rounded)
            const expectedAmount = Math.round(cartItem.price * 100)
            expect(unitAmount).toBe(expectedAmount)
            
            // Verify unit_amount is positive
            expect(unitAmount).toBeGreaterThan(0)
          })
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 21: Price Validation - invalid prices cause session creation to fail', async () => {
    // Feature: stripe-payment-integration, Property 21: Price Validation
    // **Validates: Requirements 10.3**
    
    // This property test verifies that for any cart items, when creating a Checkout Session,
    // all item prices SHALL be positive numbers (greater than zero), and items with invalid
    // prices SHALL cause session creation to fail.

    await fc.assert(
      fc.asyncProperty(
        fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
        customerInfoArbitrary,
        fc.constantFrom(-100, -1, 0), // Invalid price values
        async (cartItems, customerInfo, invalidPrice) => {
          jest.clearAllMocks()
          
          // Create a cart with at least one invalid price
          const invalidCartItems = [
            ...cartItems,
            {
              id: 'invalid-item',
              name: 'Invalid Item',
              price: invalidPrice,
              quantity: 1,
            }
          ]

          const request = new NextRequest('http://localhost:3000/api/checkout/session', {
            method: 'POST',
            body: JSON.stringify({
              items: invalidCartItems,
              customerInfo,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          // Verify request fails with 400 status
          expect(response.status).toBe(400)
          
          // Verify error message is present
          expect(data.error).toBeDefined()
          expect(typeof data.error).toBe('string')
          
          // Verify Stripe session was NOT created
          expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Checkout Session API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create session successfully with valid cart and customer info', async () => {
    const mockSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    }
    
    ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: 100, quantity: 2 },
          { id: '2', name: 'Product 2', price: 50, quantity: 1 },
        ],
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessionId).toBe('cs_test_123')
    expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123')
    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1)
  })

  it('should reject empty cart with 400 error', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Sepetiniz boş. Lütfen ürün ekleyin.')
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should reject zero total amount with 400 error', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: 0, quantity: 1 },
        ],
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz ürün fiyatı.')
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should reject missing customer info with 400 error', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: 100, quantity: 1 },
        ],
        customerInfo: {
          name: '',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Lütfen tüm alanları doldurun.')
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should handle Stripe API errors gracefully', async () => {
    ;(stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
      new Error('Stripe API error')
    )

    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: 100, quantity: 1 },
        ],
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
  })

  it('should reject negative prices with 400 error', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: -50, quantity: 1 },
        ],
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz ürün fiyatı.')
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should reject zero or negative quantities with 400 error', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: 100, quantity: 0 },
        ],
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz ürün miktarı.')
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should store customer info in session metadata', async () => {
    const mockSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    }
    
    ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

    const customerInfo = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
    }

    const request = new NextRequest('http://localhost:3000/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { id: '1', name: 'Product 1', price: 100, quantity: 1 },
        ],
        customerInfo,
      }),
    })

    await POST(request)

    const createCall = (stripe.checkout.sessions.create as jest.Mock).mock.calls[0][0]
    
    expect(createCall.metadata.customerName).toBe(customerInfo.name)
    expect(createCall.metadata.customerEmail).toBe(customerInfo.email)
    expect(createCall.metadata.customerPhone).toBe(customerInfo.phone)
    expect(createCall.metadata.customerAddress).toBe(customerInfo.address)
  })
})
