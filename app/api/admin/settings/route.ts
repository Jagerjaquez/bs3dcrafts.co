/**
 * Admin Settings Management API
 * GET /api/admin/settings - Get all settings
 * PUT /api/admin/settings - Update settings
 * POST /api/admin/settings/reset - Reset setting to default
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { SettingsSchema, BulkSettingsSchema } from '@/lib/cms-validation'
import { logAudit } from '@/lib/audit-log'
import { revalidatePath, revalidateTag } from 'next/cache'

// Default settings
const DEFAULT_SETTINGS: Record<string, Record<string, string>> = {
  general: {
    'site_title': 'BS3DCrafts',
    'site_tagline': 'Premium 3D Baskı Ürünleri',
    'site_description': 'Yüksek kaliteli 3D baskı ürünleri satın alın',
    'logo_url': '/logo.png',
  },
  contact: {
    'contact_email': 'contact@bs3dcrafts.co',
    'contact_phone': '+90 555 123 4567',
    'contact_address': 'İstanbul, Turkey',
  },
  social: {
    'social_facebook': 'https://facebook.com/bs3dcrafts',
    'social_instagram': 'https://instagram.com/bs3dcrafts',
    'social_twitter': 'https://twitter.com/bs3dcrafts',
    'social_whatsapp': 'https://wa.me/905551234567',
  },
  email: {
    'email_from': 'noreply@bs3dcrafts.co',
    'email_support': 'support@bs3dcrafts.co',
  },
  features: {
    'feature_newsletter': 'true',
    'feature_testimonials': 'true',
    'feature_whatsapp': 'true',
  },
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const settings = await prisma.settings.findMany({
      orderBy: { category: 'asc' },
    })

    // Group by category
    const grouped: Record<string, Record<string, string>> = {}
    settings.forEach((setting) => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {}
      }
      grouped[setting.category][setting.key] = setting.value
    })

    return NextResponse.json(grouped)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Ayarlar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const body = await request.json()

    // Validate the request body structure
    const validationResult = BulkSettingsSchema.safeParse(body.settings || body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Geçersiz ayar formatı',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    const category =
      typeof body.category === 'string' && body.category ? body.category : 'general'

    let pairs: [string, string][] = []
    if (body.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)) {
      pairs = Object.entries(body.settings as Record<string, unknown>).filter(
        (e): e is [string, string] => typeof e[1] === 'string'
      )
    } else {
      pairs = Object.entries(validationResult.data).filter(
        ([k, v]) => typeof v === 'string'
      ) as [string, string][]
    }

    const updates: { key: string; value: string }[] = []
    for (const [key, value] of pairs) {
      // URL validation for URL fields and social media fields
      if ((key.includes('url') || key.includes('social_') || key.includes('website')) && value !== '') {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return NextResponse.json({ error: `${key} geçerli bir URL değil` }, { status: 400 })
        }
      }
      
      // Email validation
      if (key.includes('email') && value !== '') {
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return NextResponse.json({ error: `${key} geçerli bir email değil` }, { status: 400 })
        }
      }
      
      updates.push({ key, value })
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Güncellenecek ayar yok' }, { status: 400 })
    }
    for (const update of updates) {
      await prisma.settings.upsert({
        where: { key: update.key },
        update: { value: update.value, category },
        create: {
          key: update.key,
          value: update.value,
          category,
        },
      })
    }

    await logAudit({
      action: 'settings_changed',
      userId: 'admin',
      success: true,
      details: { category, updatedCount: updates.length },
    })

    // Invalidate cache
    revalidatePath('/api/content/settings')
    revalidateTag('settings', 'max')

    return NextResponse.json({ message: 'Ayarlar başarıyla güncellendi' })
  } catch (error) {
    console.error('Error updating settings:', error)
    await logAudit({
      action: 'settings_changed',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Ayarlar güncellenemedi' },
      { status: 500 }
    )
  }
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

    // Get default value
    const defaultValue = DEFAULT_SETTINGS[category]?.[key]
    if (!defaultValue) {
      return NextResponse.json(
        { error: 'Bu ayar için varsayılan değer bulunamadı' },
        { status: 400 }
      )
    }

    // Reset to default
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
    console.error('Error resetting setting:', error)
    await logAudit({
      action: 'settings_changed',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Ayar sıfırlanamadı' },
      { status: 500 }
    )
  }
}
