import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const CMS_CACHE_TAG = 'cms'

const HERO_DEFAULTS: Record<string, string> = {
  hero_badge: 'Premium 3D Printing',
  hero_title_line1: 'Her Katmanda',
  hero_title_gradient: 'Mükemmellik',
  hero_subtitle:
    '3D baskı teknolojisi ile üretilen premium kalite ürünler. Her detayda mükemmellik.',
  hero_cta: 'Ürünleri Keşfet',
}

function valueToText(val: unknown): string | null {
  if (typeof val === 'string') return val
  if (val && typeof val === 'object' && 'text' in val) {
    const t = (val as { text?: unknown }).text
    if (typeof t === 'string') return t
  }
  return null
}

async function loadHomepageFields(): Promise<Record<string, string>> {
  const out = { ...HERO_DEFAULTS }
  try {
    const rows = await prisma.siteContent.findMany({
      where: { section: 'homepage' },
    })
    for (const r of rows) {
      const text = valueToText(r.value)
      if (text !== null) out[r.key] = text
    }
  } catch {
    /* DB yoksa varsayılanlar */
  }
  return out
}

export const getHomepageCmsFields = unstable_cache(loadHomepageFields, ['homepage-cms-fields'], {
  revalidate: 120,
  tags: [CMS_CACHE_TAG],
})

export async function getPublishedPageSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    return await prisma.page.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    })
  } catch {
    return []
  }
}
