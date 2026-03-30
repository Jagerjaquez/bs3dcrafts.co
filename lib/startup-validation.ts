/**
 * Startup Validation
 * 
 * This module performs validation checks when the application starts.
 * It ensures all required configuration is present before the app begins processing requests.
 */

import { validateEnvironmentOrThrow, getEnvironmentSummary } from './env-validation'

/**
 * Performs all startup validation checks
 * 
 * This function should be called early in the application lifecycle,
 * ideally in the root layout or a middleware.
 * 
 * @throws Error if any validation fails
 */
export function performStartupValidation(): void {
  console.log('🔍 Performing startup validation...')
  
  try {
    // Validate environment variables
    validateEnvironmentOrThrow()
    
    // Log environment summary
    const envSummary = getEnvironmentSummary()
    console.log('✅ Environment validation passed')
    console.log('📊 Environment Summary:')
    console.log(`   - Node Environment: ${envSummary.nodeEnv}`)
    console.log(`   - App URL: ${envSummary.appUrl}`)
    console.log(`   - HTTPS Enabled: ${envSummary.usesHttps ? '✅' : '❌'}`)
    console.log(`   - Stripe Mode: ${envSummary.stripeMode}`)
    console.log(`   - Database Connected: ${envSummary.hasDatabase ? '✅' : '❌'}`)
    console.log(`   - Webhook Secret Set: ${envSummary.hasWebhookSecret ? '✅' : '❌'}`)
    
    // Production-specific warnings
    if (envSummary.isProduction) {
      console.log('')
      console.log('🚀 Running in PRODUCTION mode')
      
      if (!envSummary.usesHttps) {
        console.error('❌ CRITICAL: HTTPS is not enabled in production!')
        console.error('   Stripe requires HTTPS for payment processing.')
        console.error('   Update NEXT_PUBLIC_APP_URL to use https://')
      }
      
      if (envSummary.stripeMode === 'test') {
        console.warn('⚠️  WARNING: Using Stripe TEST mode in production!')
        console.warn('   Real payments will not be processed.')
        console.warn('   Update to use live Stripe keys (sk_live_, pk_live_)')
      }
    } else {
      console.log('')
      console.log('🔧 Running in DEVELOPMENT mode')
      
      if (envSummary.stripeMode === 'live') {
        console.warn('⚠️  WARNING: Using Stripe LIVE keys in development!')
        console.warn('   Consider using test keys (sk_test_, pk_test_) for development.')
      }
    }
    
    console.log('')
    console.log('✅ Startup validation complete')
    console.log('')
    
  } catch (error) {
    console.error('')
    console.error('❌ Startup validation failed!')
    console.error('')
    
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('Unknown error during startup validation')
    }
    
    console.error('')
    console.error('Application cannot start with invalid configuration.')
    console.error('Please fix the errors above and restart the application.')
    console.error('')
    
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    
    // In development, log warning but allow to continue
    console.warn('⚠️  Continuing in development mode despite validation errors...')
    console.warn('')
  }
}

/**
 * Validates that the application is ready to process payments
 * 
 * This can be called before critical payment operations to ensure
 * the system is properly configured.
 * 
 * @returns true if ready, false otherwise
 */
export function isReadyForPayments(): boolean {
  try {
    const envSummary = getEnvironmentSummary()
    
    // Check all required components
    const hasStripe = envSummary.hasStripeKeys && envSummary.hasWebhookSecret
    const hasDatabase = envSummary.hasDatabase
    const hasValidUrl = !!envSummary.appUrl && envSummary.appUrl !== 'not set'
    
    // In production, also require HTTPS
    const httpsValid = !envSummary.isProduction || envSummary.usesHttps
    
    return hasStripe && hasDatabase && hasValidUrl && httpsValid
    
  } catch {
    return false
  }
}
