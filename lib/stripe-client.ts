import Stripe from 'stripe'
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe client
export function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  return new Stripe(secretKey, {
    apiVersion: '2024-06-20',
  })
}

// Export a getter function instead of direct instance
export const getStripeClient = () => {
  try {
    return createStripeClient()
  } catch (error) {
    console.error('Failed to create Stripe client:', error)
    throw error
  }
}

// Client-side Stripe loader
let stripePromise: Promise<StripeJS | null>

export const getStripePromise = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}
