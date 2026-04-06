import { NextResponse } from 'next/server'

/**
 * Deprecated: Stripe Checkout Session endpoint removed
 * This endpoint is no longer in use. Use /api/checkout/paytr instead for PayTR payments.
 */
export async function POST() {
  return NextResponse.json(
    { 
      error: 'Bu endpoint kaldırılmıştır. PayTR ödeme sistemi aktiftir.',
      details: 'Lütfen /api/checkout/paytr kullanınız.'
    },
    { status: 410 }
  )
}
