import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CMS_CACHE_TAG } from '@/lib/cms-public'
import { logAudit } from '@/lib/audit-log'

type NavRow = {
  id?: string
  type?: string
  label?: string
  url?: string
  parentId?: string | null
  order?: number
}

async function importNavigationReplace(rows: NavRow[]) {
  const idMap = new Map<string, string>()
  const withId = rows.filter((n) => n.id)
  const roots = withId.filter((n) => !n.parentId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const n of roots) {
    if (!n.label || !n.url || !n.id) continue
    const created = await prisma.navigation.create({
      data: {
        type: n.type || 'header',
        label: n.label,
        url: n.url,
        parentId: null,
        order: typeof n.order === 'number' ? n.order : 0,
      },
    })
    idMap.set(n.id, created.id)
  }
  const children = withId.filter((n) => n.parentId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const n of children) {
    if (!n.label || !n.url || !n.id || !n.parentId) continue
    const parentNew = idMap.get(n.parentId)
    if (!parentNew) continue
    const created = await prisma.navigation.create({
      data: {
        type: n.type || 'header',
        label: n.label,
        url: n.url,
        parentId: parentNew,
        order: typeof n.order === 'number' ? n.order : 0,
      },
    })
    idMap.set(n.id, created.id)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    const body = await request.json()
    const mode = body.mode === 'merge' ? 'merge' : 'replace'

    if (!body.siteContent && !body.pages && !body.settings && !body.navigation) {
      return NextResponse.json({ error: 'Geçersiz yedek dosyası' }, { status: 400 })
    }

    if (mode === 'replace') {
      await prisma.$transaction([
        prisma.siteContent.deleteMany(),
        prisma.page.deleteMany(),
        prisma.settings.deleteMany(),
        prisma.navigation.deleteMany(),
      ])
    }

    if (Array.isArray(body.siteContent)) {
      for (const row of body.siteContent) {
        if (!row?.key) continue
        await prisma.siteContent.upsert({
          where: { key: row.key },
          update: { value: row.value, section: row.section || 'homepage' },
          create: {
            key: row.key,
            value: row.value,
            section: row.section || 'homepage',
          },
        })
      }
    }

    if (Array.isArray(body.pages)) {
      for (const p of body.pages) {
        if (!p?.slug) continue
        await prisma.page.upsert({
          where: { slug: p.slug },
          update: {
            title: p.title,
            content: p.content,
            metaTitle: p.metaTitle ?? null,
            metaDescription: p.metaDescription ?? null,
            keywords: p.keywords ?? null,
            status: p.status || 'draft',
          },
          create: {
            title: p.title || p.slug,
            slug: p.slug,
            content: p.content || '',
            metaTitle: p.metaTitle ?? null,
            metaDescription: p.metaDescription ?? null,
            keywords: p.keywords ?? null,
            status: p.status || 'draft',
          },
        })
      }
    }

    if (Array.isArray(body.settings)) {
      for (const s of body.settings) {
        if (!s?.key) continue
        await prisma.settings.upsert({
          where: { key: s.key },
          update: { value: s.value, category: s.category || 'general' },
          create: {
            key: s.key,
            value: s.value,
            category: s.category || 'general',
          },
        })
      }
    }

    if (Array.isArray(body.navigation)) {
      if (mode === 'replace') {
        await importNavigationReplace(body.navigation as NavRow[])
      } else {
        for (const n of body.navigation as NavRow[]) {
          if (!n?.label || !n?.url) continue
          await prisma.navigation.create({
            data: {
              type: n.type || 'header',
              label: n.label,
              url: n.url,
              parentId: n.parentId || null,
              order: typeof n.order === 'number' ? n.order : 0,
            },
          })
        }
      }
    }

    await logAudit({
      action: 'settings_changed',
      userId: 'admin',
      success: true,
      details: { action: 'cms_import', mode },
    })

    revalidatePath('/')
    revalidateTag(CMS_CACHE_TAG, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Backup import error:', error)
    return NextResponse.json({ error: 'İçe aktarma başarısız' }, { status: 500 })
  }
}
