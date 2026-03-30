import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasDatabase: !!process.env.DATABASE_URL,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    stripeSecretPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'missing',
    stripePublishablePrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'missing',
  })
}
