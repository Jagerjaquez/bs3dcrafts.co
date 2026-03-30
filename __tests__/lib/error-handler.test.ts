import fc from 'fast-check'
import { logError, createErrorResponse, ErrorCode, ERROR_MESSAGES } from '@/lib/error-handler'

describe('Error Handler - Property Tests', () => {
  // Mock console methods
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('Property 15: Error Logging Completeness - errors are logged with timestamp, message, and context', async () => {
    // Feature: stripe-payment-integration, Property 15: Error Logging Completeness
    // **Validates: Requirements 7.4**
    
    // This property test verifies that for any error that occurs in the payment system,
    // the error SHALL be logged with timestamp, error message, and contextual details
    // (endpoint, user action, etc.).

    // Arbitraries for test data generation
    const componentArbitrary = fc.constantFrom(
      'checkout-api',
      'webhook-handler',
      'order-manager'
    )

    const errorMessageArbitrary = fc.string({ minLength: 1, maxLength: 200 })

    const contextArbitrary = fc.record({
      endpoint: fc.option(fc.constantFrom('/api/checkout/session', '/api/webhooks/stripe'), { nil: undefined }),
      userId: fc.option(fc.uuid(), { nil: undefined }),
      sessionId: fc.option(fc.string({ minLength: 20, maxLength: 50 }), { nil: undefined }),
      orderId: fc.option(fc.uuid(), { nil: undefined }),
      action: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    })

    const levelArbitrary = fc.constantFrom('error' as const, 'warn' as const)

    await fc.assert(
      fc.asyncProperty(
        componentArbitrary,
        errorMessageArbitrary,
        contextArbitrary,
        levelArbitrary,
        async (component, errorMessage, context, level) => {
          jest.clearAllMocks()

          // Create an error object
          const error = new Error(errorMessage)

          // Call logError
          logError(component, error, context, level)

          // Property 1: Console method should be called
          if (level === 'error') {
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
          } else {
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
          }

          // Get the logged data
          const logCall = level === 'error' ? consoleErrorSpy.mock.calls[0] : consoleWarnSpy.mock.calls[0]
          const loggedData = JSON.parse(logCall[1])

          // Property 2: Log should contain timestamp
          expect(loggedData.timestamp).toBeDefined()
          expect(typeof loggedData.timestamp).toBe('string')
          expect(new Date(loggedData.timestamp).toString()).not.toBe('Invalid Date')

          // Property 3: Log should contain error message
          expect(loggedData.error).toBe(errorMessage)

          // Property 4: Log should contain component
          expect(loggedData.component).toBe(component)

          // Property 5: Log should contain level
          expect(loggedData.level).toBe(level)

          // Property 6: Log should contain context
          expect(loggedData.context).toBeDefined()
          expect(typeof loggedData.context).toBe('object')

          // Property 7: Context should contain all provided fields
          Object.keys(context).forEach(key => {
            if (context[key] !== undefined) {
              expect(loggedData.context[key]).toBe(context[key])
            }
          })

          // Property 8: Log should contain stack trace for Error objects
          expect(loggedData.stack).toBeDefined()
          expect(typeof loggedData.stack).toBe('string')
        }
      ),
      { numRuns: 5 }
    )
  })

  it('Property 15 (String Errors): Error Logging Completeness - string errors are logged with timestamp, message, and context', async () => {
    // This test verifies that string error messages (not Error objects) are also logged correctly

    const componentArbitrary = fc.constantFrom(
      'checkout-api',
      'webhook-handler',
      'order-manager'
    )

    const errorMessageArbitrary = fc.string({ minLength: 1, maxLength: 200 })

    const contextArbitrary = fc.record({
      endpoint: fc.option(fc.constantFrom('/api/checkout/session', '/api/webhooks/stripe'), { nil: undefined }),
      userId: fc.option(fc.uuid(), { nil: undefined }),
    })

    await fc.assert(
      fc.asyncProperty(
        componentArbitrary,
        errorMessageArbitrary,
        contextArbitrary,
        async (component, errorMessage, context) => {
          jest.clearAllMocks()

          // Call logError with string error
          logError(component, errorMessage, context)

          // Property 1: Console.error should be called
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

          // Get the logged data
          const logCall = consoleErrorSpy.mock.calls[0]
          const loggedData = JSON.parse(logCall[1])

          // Property 2: Log should contain timestamp
          expect(loggedData.timestamp).toBeDefined()
          expect(typeof loggedData.timestamp).toBe('string')

          // Property 3: Log should contain error message
          expect(loggedData.error).toBe(errorMessage)

          // Property 4: Log should contain component
          expect(loggedData.component).toBe(component)

          // Property 5: Log should contain context
          expect(loggedData.context).toBeDefined()

          // Property 6: Stack should be undefined for string errors
          expect(loggedData.stack).toBeUndefined()
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Error Handler - Unit Tests', () => {
  describe('createErrorResponse', () => {
    it('should create error response with all required fields', () => {
      const response = createErrorResponse(
        ERROR_MESSAGES.EMPTY_CART,
        ErrorCode.EMPTY_CART,
        'Cart is empty'
      )

      expect(response.error).toBe(ERROR_MESSAGES.EMPTY_CART)
      expect(response.code).toBe(ErrorCode.EMPTY_CART)
      expect(response.timestamp).toBeDefined()
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date')
    })

    it('should include details in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const response = createErrorResponse(
        ERROR_MESSAGES.GENERIC_ERROR,
        ErrorCode.GENERIC_ERROR,
        'Detailed error information'
      )

      expect(response.details).toBe('Detailed error information')

      process.env.NODE_ENV = originalEnv
    })

    it('should exclude details in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const response = createErrorResponse(
        ERROR_MESSAGES.GENERIC_ERROR,
        ErrorCode.GENERIC_ERROR,
        'Detailed error information'
      )

      expect(response.details).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('logError', () => {
    let consoleErrorSpy: jest.SpyInstance
    let consoleWarnSpy: jest.SpyInstance

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('should log error with Error object', () => {
      const error = new Error('Test error')
      const context = { endpoint: '/api/test', userId: 'user123' }

      logError('test-component', error, context)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const logCall = consoleErrorSpy.mock.calls[0]
      const loggedData = JSON.parse(logCall[1])

      expect(loggedData.error).toBe('Test error')
      expect(loggedData.component).toBe('test-component')
      expect(loggedData.context).toEqual(context)
      expect(loggedData.stack).toBeDefined()
    })

    it('should log error with string message', () => {
      const context = { endpoint: '/api/test' }

      logError('test-component', 'String error message', context)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const logCall = consoleErrorSpy.mock.calls[0]
      const loggedData = JSON.parse(logCall[1])

      expect(loggedData.error).toBe('String error message')
      expect(loggedData.stack).toBeUndefined()
    })

    it('should log warning when level is warn', () => {
      const error = new Error('Warning message')

      logError('test-component', error, {}, 'warn')

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })
})
