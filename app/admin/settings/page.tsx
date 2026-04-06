'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminJsonHeaders } from '@/lib/admin-client'

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Genel',
  contact: 'İletişim',
  social: 'Sosyal',
  email: 'E-posta',
  features: 'Özellikler',
  analytics: 'Analitik',
}

export default function AdminSettingsPage() {
  const [grouped, setGrouped] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' })
      if (res.ok) setGrouped(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveCategory = async (category: string) => {
    const settings = grouped[category]
    if (!settings) return
    setSaving(category)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ category, settings }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        alert((d as { error?: string }).error || 'Kayıt başarısız')
        return
      }
      alert('Kaydedildi')
    } finally {
      setSaving(null)
    }
  }

  const updateField = (category: string, key: string, value: string) => {
    setGrouped((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }))
  }

  if (loading) {
    return <p className="text-white">Yükleniyor…</p>
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <h1 className="text-4xl font-bold text-white">Site ayarları</h1>
      {Object.entries(grouped).map(([category, fields]) => (
        <div key={category} className="glass border border-primary/20 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {CATEGORY_LABELS[category] || category}
          </h2>
          <div className="space-y-3">
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-gray-400 block">{key}</label>
                <Input
                  value={value}
                  onChange={(e) => updateField(category, key, e.target.value)}
                  className="bg-black/20 border-primary/20 text-white"
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => saveCategory(category)}
            disabled={saving === category}
          >
            {saving === category ? 'Kaydediliyor…' : 'Bu bölümü kaydet'}
          </Button>
        </div>
      ))}
    </div>
  )
}
