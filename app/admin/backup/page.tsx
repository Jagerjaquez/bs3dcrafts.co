'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { adminJsonHeaders } from '@/lib/admin-client'

export default function AdminBackupPage() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const exportJson = async () => {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/backup/export', { credentials: 'include' })
      if (!res.ok) {
        setMessage('Dışa aktarma başarısız')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cms-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage('İndirildi')
    } finally {
      setBusy(false)
    }
  }

  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setMessage('')
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const mode = confirm('Tüm CMS verisini silip yedekten mi yüklemek istersiniz? İptal = birleştir (navigation ekler).')
        ? 'replace'
        : 'merge'
      const res = await fetch('/api/admin/backup/import', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ ...data, mode }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage((d as { error?: string }).error || 'İçe aktarma başarısız')
        return
      }
      setMessage('İçe aktarma tamam')
    } catch {
      setMessage('Dosya okunamadı')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-4xl font-bold text-white">Yedekleme</h1>
      <p className="text-gray-400 text-sm">
        İçerik, sayfalar, ayarlar ve navigasyon dışa aktarılır. Medya dosyalarının kendisi dahil değildir; yalnızca
        veritabanı kayıtları.
      </p>
      <div className="flex flex-col gap-4 glass border border-primary/20 rounded-lg p-6">
        <Button type="button" disabled={busy} onClick={exportJson}>
          JSON indir
        </Button>
        <div>
          <label className="text-sm text-gray-300 block mb-2">JSON içe aktar</label>
          <input type="file" accept="application/json,.json" onChange={importFile} disabled={busy} />
        </div>
        {message && <p className="text-primary text-sm">{message}</p>}
      </div>
    </div>
  )
}
