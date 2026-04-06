import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CMS_CACHE_TAG } from '@/lib/cms-public'

const DEFAULTS: { key: string; text: string }[] = [
  { key: 'hero_badge', text: 'Premium 3D Printing' },
  { key: 'hero_title_line1', text: 'Her Katmanda' },
  { key: 'hero_title_gradient', text: 'Mükemmellik' },
  {
    key: 'hero_subtitle',
    text: '3D baskı teknolojisi ile üretilen premium kalite ürünler. Her detayda mükemmellik.',
  },
  { key: 'hero_cta', text: 'Ürünleri Keşfet' },
]

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    let created = 0
    for (const { key, text } of DEFAULTS) {
      const exists = await prisma.siteContent.findUnique({ where: { key } })
      if (exists) continue
      await prisma.siteContent.create({
        data: {
          key,
          section: 'homepage',
          value: { text },
        },
      })
      created++
    }

    revalidatePath('/')
    revalidatePath('/api/content/homepage')
    revalidateTag(CMS_CACHE_TAG, 'max')

    return NextResponse.json({ message: 'Tamam', created })
  } catch (error) {
    console.error('Seed homepage error:', error)
    return NextResponse.json({ error: 'Seed başarısız' }, { status: 500 })
  }
}
