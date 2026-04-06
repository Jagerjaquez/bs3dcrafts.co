'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminJsonHeaders } from '@/lib/admin-client'

const HERO_KEYS = [
  { key: 'hero_badge', label: 'Rozet metni' },
  { key: 'hero_title_line1', label: 'Başlık (birinci satır)' },
  { key: 'hero_title_gradient', label: 'Başlık (vurgulu kelime)' },
  { key: 'hero_subtitle', label: 'Alt başlık' },
  { key: 'hero_cta', label: 'Buton metni' },
] as const

type Row = { key: string; section: string; value: unknown }

function toText(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'text' in v && typeof (v as { text: string }).text === 'string') {
    return (v as { text: string }).text
  }
  return ''
}

export default function AdminHomepageContentPage() {
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content', { credentials: 'include' })
      if (!res.ok) return
      const rows: Row[] = await res.json()
      const map: Record<string, string> = {}
      for (const r of rows.filter((x) => x.section === 'homepage')) {
        map[r.key] = toText(r.value)
      }
      setTexts(map)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const seed = async () => {
    const res = await fetch('/api/admin/content/seed-homepage', {
      method: 'POST',
      credentials: 'include',
      headers: adminJsonHeaders(),
      body: JSON.stringify({}),
    })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert((d as { error?: string }).error || 'Seed başarısız')
      return
    }
    alert(`Varsayılan alanlar: ${(d as { created?: number }).created ?? 0} yeni kayıt`)
    load()
  }

  const saveKey = async (key: string) => {
    setSaving(key)
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(key)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ value: { text: texts[key] || '' } }),
      })
      if (res.status === 404) {
        const create = await fetch('/api/admin/content', {
          method: 'POST',
          credentials: 'include',
          headers: adminJsonHeaders(),
          body: JSON.stringify({
            key,
            section: 'homepage',
            value: { text: texts[key] || '' },
          }),
        })
        if (!create.ok) {
          const d = await create.json().catch(() => ({}))
          alert((d as { error?: string }).error || 'Oluşturulamadı')
          return
        }
      } else if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert((d as { error?: string }).error || 'Kayıt başarısız')
        return
      }
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <p className="text-white">Yükleniyor…</p>

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-4xl font-bold text-white">Ana sayfa metinleri</h1>
        <Button type="button" variant="outline" onClick={seed}>
          Varsayılan hero alanlarını oluştur
        </Button>
      </div>
      <p className="text-gray-400 text-sm">
        Bu alanlar ana sayfa kahraman bölümünde gösterilir. Önce “Varsayılan oluştur” ile kayıtları ekleyebilirsiniz.
      </p>
      <div className="space-y-6">
        {HERO_KEYS.map(({ key, label }) => (
          <div key={key} className="glass border border-primary/20 rounded-lg p-4 space-y-2">
            <label className="text-sm text-gray-300">{label}</label>
            <Input
              value={texts[key] ?? ''}
              onChange={(e) => setTexts((t) => ({ ...t, [key]: e.target.value }))}
              className="bg-black/20 border-primary/20 text-white"
            />
            <Button type="button" size="sm" disabled={saving === key} onClick={() => saveKey(key)}>
              {saving === key ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
