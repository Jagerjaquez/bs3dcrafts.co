import { NextResponse } from 'next/server'

/**
 * Deprecated: Stripe endpoint removed
 * Use /api/checkout/paytr instead for PayTR payments
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Bu endpoint kaldırılmıştır. Lütfen /api/checkout/paytr kullanınız.' },
    { status: 410 }
  )
}
