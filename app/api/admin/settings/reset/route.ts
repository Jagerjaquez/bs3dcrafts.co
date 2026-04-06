import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath, revalidateTag } from 'next/cache'

const DEFAULT_SETTINGS: Record<string, Record<string, string>> = {
  general: {
    site_title: 'BS3DCrafts',
    site_tagline: 'Premium 3D Baskı Ürünleri',
    site_description: 'Yüksek kaliteli 3D baskı ürünleri satın alın',
    logo_url: '/logo.png',
  },
  contact: {
    contact_email: 'contact@bs3dcrafts.co',
    contact_phone: '+90 555 123 4567',
    contact_address: 'İstanbul, Turkey',
  },
  social: {
    social_facebook: 'https://facebook.com/bs3dcrafts',
    social_instagram: 'https://instagram.com/bs3dcrafts',
    social_twitter: 'https://twitter.com/bs3dcrafts',
    social_whatsapp: 'https://wa.me/905551234567',
  },
  email: {
    email_from: 'noreply@bs3dcrafts.co',
    email_support: 'support@bs3dcrafts.co',
  },
  features: {
    feature_newsletter: 'true',
    feature_testimonials: 'true',
    feature_whatsapp: 'true',
  },
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const body = await request.json()
    const { key, category } = body

    if (!key || !category) {
      return NextResponse.json(
        { error: 'Anahtar ve kategori gerekli' },
        { status: 400 }
      )
    }

    const defaultValue = DEFAULT_SETTINGS[category]?.[key]
    if (!defaultValue) {
      return NextResponse.json(
        { error: 'Bu ayar için varsayılan değer bulunamadı' },
        { status: 400 }
      )
    }

    await prisma.settings.upsert({
      where: { key },
      update: { value: defaultValue },
      create: { key, value: defaultValue, category },
    })

    await logAudit({
      action: 'settings_changed',
      userId: 'admin',
      success: true,
      details: { key, category, action: 'reset' },
    })

    revalidatePath('/api/content/settings')
    revalidateTag('settings', 'max')

    return NextResponse.json({ message: `${key} varsayılan değere sıfırlandı` })
  } catch (error) {
    console.error('Settings reset error:', error)
    return NextResponse.json({ error: 'Ayar sıfırlanamadı' }, { status: 500 })
  }
}
