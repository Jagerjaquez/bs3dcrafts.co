import { validateEnvironmentVariables, validateEnvironmentOrThrow, getEnvironmentSummary } from '@/lib/env-validation'

describe('Environment Validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('validateEnvironmentVariables', () => {
    it('should pass validation when all required variables are set', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(true)
      expect(result.missingVars).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.missingVars).toContain('DATABASE_URL')
      expect(result.errors.some(e => e.includes('DATABASE_URL'))).toBe(true)
    })

    it('should fail validation when STRIPE_SECRET_KEY is missing', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      delete process.env.STRIPE_SECRET_KEY
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.missingVars).toContain('STRIPE_SECRET_KEY')
    })

    it('should fail validation when STRIPE_WEBHOOK_SECRET is missing', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      delete process.env.STRIPE_WEBHOOK_SECRET
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.missingVars).toContain('STRIPE_WEBHOOK_SECRET')
    })

    it('should fail validation when NEXT_PUBLIC_APP_URL is missing', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      delete process.env.NEXT_PUBLIC_APP_URL

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.missingVars).toContain('NEXT_PUBLIC_APP_URL')
    })

    it('should detect multiple missing variables', () => {
      delete process.env.DATABASE_URL
      delete process.env.STRIPE_SECRET_KEY
      delete process.env.STRIPE_WEBHOOK_SECRET

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.missingVars).toHaveLength(3)
      expect(result.missingVars).toContain('DATABASE_URL')
      expect(result.missingVars).toContain('STRIPE_SECRET_KEY')
      expect(result.missingVars).toContain('STRIPE_WEBHOOK_SECRET')
    })

    it('should warn when using HTTP in production', () => {
      process.env.NODE_ENV = 'production'
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://example.com' // HTTP in production!

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('HTTPS') && e.includes('production'))).toBe(true)
    })

    it('should pass when using HTTPS in production', () => {
      process.env.NODE_ENV = 'production'
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should warn when using test keys in production', () => {
      process.env.NODE_ENV = 'production'
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789' // Test key in production!
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('test key') && e.includes('production'))).toBe(true)
    })

    it('should detect invalid Stripe secret key format', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'invalid_key_format'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('STRIPE_SECRET_KEY') && e.includes('format'))).toBe(true)
    })

    it('should detect invalid Stripe publishable key format', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'invalid_key_format'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') && e.includes('format'))).toBe(true)
    })

    it('should detect invalid webhook secret format', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'invalid_secret'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('STRIPE_WEBHOOK_SECRET') && e.includes('format'))).toBe(true)
    })

    it('should detect invalid URL format', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'not-a-valid-url'

      const result = validateEnvironmentVariables()

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Invalid') && e.includes('URL'))).toBe(true)
    })
  })

  describe('validateEnvironmentOrThrow', () => {
    it('should not throw when all variables are valid', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      expect(() => validateEnvironmentOrThrow()).not.toThrow()
    })

    it('should throw when variables are missing', () => {
      delete process.env.DATABASE_URL
      delete process.env.STRIPE_SECRET_KEY

      expect(() => validateEnvironmentOrThrow()).toThrow(/Environment Variable Validation Failed/)
    })

    it('should throw with detailed error message', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      expect(() => validateEnvironmentOrThrow()).toThrow(/STRIPE_WEBHOOK_SECRET/)
    })
  })

  describe('getEnvironmentSummary', () => {
    it('should return correct summary for development environment', () => {
      process.env.NODE_ENV = 'development'
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
      process.env.STRIPE_SECRET_KEY = 'sk_test_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const summary = getEnvironmentSummary()

      expect(summary.nodeEnv).toBe('development')
      expect(summary.hasDatabase).toBe(true)
      expect(summary.hasStripeKeys).toBe(true)
      expect(summary.hasWebhookSecret).toBe(true)
      expect(summary.appUrl).toBe('http://localhost:3000')
      expect(summary.isProduction).toBe(false)
      expect(summary.usesHttps).toBe(false)
      expect(summary.stripeMode).toBe('test')
    })

    it('should return correct summary for production environment', () => {
      process.env.NODE_ENV = 'production'
      process.env.DATABASE_URL = 'postgresql://prod:5432/db'
      process.env.STRIPE_SECRET_KEY = 'sk_live_123456789'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_123456789'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123456789'
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

      const summary = getEnvironmentSummary()

      expect(summary.nodeEnv).toBe('production')
      expect(summary.isProduction).toBe(true)
      expect(summary.usesHttps).toBe(true)
      expect(summary.stripeMode).toBe('live')
    })

    it('should handle missing variables gracefully', () => {
      delete process.env.DATABASE_URL
      delete process.env.STRIPE_SECRET_KEY
      delete process.env.NEXT_PUBLIC_APP_URL

      const summary = getEnvironmentSummary()

      expect(summary.hasDatabase).toBe(false)
      expect(summary.hasStripeKeys).toBe(false)
      expect(summary.appUrl).toBe('not set')
    })
  })
})
