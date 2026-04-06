import { NextRequest, NextResponse } from 'next/server'
import { getPublishedProductBySlug } from '@/lib/public-products'
import { rateLimitMiddleware, RateLimitPresets } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const limited = await rateLimitMiddleware(request, RateLimitPresets.PUBLIC)
  if (limited) return limited

  try {
    const { slug } = await params
    const product = await getPublishedProductBySlug(slug)
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
    }
    const res = NextResponse.json(product)
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
    return res
  } catch (e) {
    console.error('Public product get error:', e)
    return NextResponse.json({ error: 'Ürün yüklenemedi' }, { status: 500 })
  }
}
