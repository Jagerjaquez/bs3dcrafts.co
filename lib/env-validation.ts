/**
 * Environment Variable Validation
 * 
 * This module validates required environment variables at application startup.
 * If any required variables are missing, the application will fail fast with a clear error message.
 * 
 * This prevents runtime errors and ensures proper configuration before processing payments.
 */

interface EnvValidationResult {
  isValid: boolean
  missingVars: string[]
  errors: string[]
}

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE_URL: 'Database connection URL',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe secret API key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable API key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook signing secret',
  
  // Application
  NEXT_PUBLIC_APP_URL: 'Application URL for redirects',
} as const

/**
 * Validates all required environment variables
 * 
 * @returns Validation result with missing variables and errors
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const missingVars: string[] = []
  const errors: string[] = []

  // Check each required variable
  for (const [varName, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName]
    
    if (!value || value.trim() === '') {
      missingVars.push(varName)
      errors.push(`Missing required environment variable: ${varName} (${description})`)
    }
  }

  // Additional validation for specific variables
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    
    // Warn if production is using HTTP instead of HTTPS
    if (process.env.NODE_ENV === 'production' && !appUrl.startsWith('https://')) {
      errors.push(
        `SECURITY WARNING: NEXT_PUBLIC_APP_URL must use HTTPS in production. ` +
        `Current value: ${appUrl}. Stripe requires HTTPS for payment processing.`
      )
    }
    
    // Validate URL format
    try {
      new URL(appUrl)
    } catch {
      errors.push(
        `Invalid NEXT_PUBLIC_APP_URL format: ${appUrl}. Must be a valid URL (e.g., https://yourdomain.com)`
      )
    }
  }

  // Validate Stripe keys format
  if (process.env.STRIPE_SECRET_KEY) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    if (!secretKey.startsWith('sk_')) {
      errors.push(
        `Invalid STRIPE_SECRET_KEY format. Must start with 'sk_test_' or 'sk_live_'`
      )
    }
    
    // Warn if using test key in production
    if (process.env.NODE_ENV === 'production' && secretKey.startsWith('sk_test_')) {
      errors.push(
        `WARNING: Using Stripe test key (sk_test_) in production environment. ` +
        `Use production key (sk_live_) for real payments.`
      )
    }
  }

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey.startsWith('pk_')) {
      errors.push(
        `Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. Must start with 'pk_test_' or 'pk_live_'`
      )
    }
    
    // Warn if using test key in production
    if (process.env.NODE_ENV === 'production' && publishableKey.startsWith('pk_test_')) {
      errors.push(
        `WARNING: Using Stripe test publishable key (pk_test_) in production environment. ` +
        `Use production key (pk_live_) for real payments.`
      )
    }
  }

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret.startsWith('whsec_')) {
      errors.push(
        `Invalid STRIPE_WEBHOOK_SECRET format. Must start with 'whsec_'`
      )
    }
  }

  return {
    isValid: missingVars.length === 0 && errors.length === 0,
    missingVars,
    errors,
  }
}

/**
 * Validates environment variables and throws an error if validation fails
 * 
 * This should be called at application startup to fail fast if configuration is invalid.
 * 
 * @throws Error if validation fails
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironmentVariables()
  
  if (!result.isValid) {
    const errorMessage = [
      '❌ Environment Variable Validation Failed',
      '',
      ...result.errors,
      '',
      'Please check your .env file and ensure all required variables are set.',
      'See DEPLOYMENT.md for configuration details.',
    ].join('\n')
    
    throw new Error(errorMessage)
  }
}

/**
 * Logs environment validation warnings without throwing
 * 
 * Useful for development environments where some warnings are acceptable.
 */
export function logEnvironmentWarnings(): void {
  const result = validateEnvironmentVariables()
  
  if (!result.isValid) {
    console.warn('⚠️  Environment Variable Warnings:')
    result.errors.forEach(error => console.warn(`  - ${error}`))
    console.warn('')
  }
}

/**
 * Gets a summary of the current environment configuration
 * 
 * @returns Object with environment information (safe for logging)
 */
export function getEnvironmentSummary() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasDatabase: !!process.env.DATABASE_URL,
    hasStripeKeys: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    isProduction: process.env.NODE_ENV === 'production',
    usesHttps: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') || false,
    stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live',
  }
}
