import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
    
    if (!hasSecretKey) {
      return NextResponse.json({
        status: 'error',
        message: 'STRIPE_SECRET_KEY eksik!',
        hasPublishableKey,
        hasSecretKey,
      }, { status: 500 })
    }

    // Try to import and create Stripe client
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    })
    
    // Test Stripe connection
    const balance = await stripe.balance.retrieve()

    return NextResponse.json({
      status: 'success',
      message: 'Stripe bağlantısı başarılı!',
      testMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
      hasPublishableKey,
      hasSecretKey,
      balanceAvailable: balance.available.length > 0,
    })
  } catch (error: any) {
    console.error('Stripe test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Stripe bağlantısı başarısız!',
      error: error.message,
      type: error.type,
      code: error.code,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10),
    }, { status: 500 })
  }
}
