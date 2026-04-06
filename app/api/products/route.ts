import { NextRequest, NextResponse } from 'next/server'
import { listPublishedCatalog } from '@/lib/public-products'
import { rateLimitMiddleware, RateLimitPresets } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const limited = await rateLimitMiddleware(request, RateLimitPresets.PUBLIC)
  if (limited) return limited

  try {
    const products = await listPublishedCatalog()
    const res = NextResponse.json(products)
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (e) {
    console.error('Public products list error:', e)
    return NextResponse.json({ error: 'Ürünler yüklenemedi' }, { status: 500 })
  }
}
