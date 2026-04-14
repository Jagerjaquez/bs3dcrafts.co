'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'

type NavItem = {
  id: string
  type: string
  label: string
  url: string
  parentId: string | null
  order: number
  children?: NavItem[]
}

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    type: 'header' as 'header' | 'footer',
    label: '',
    url: '/',
    parentId: '' as string,
    order: 0,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/navigation', { credentials: 'include' })
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const flatParents = items

  const create = async () => {
    const res = await fetch('/api/admin/navigation', {
      method: 'POST',
      credentials: 'include',
      headers: adminJsonHeaders(),
      body: JSON.stringify({
        type: form.type,
        label: form.label,
        url: form.url,
        order: form.order,
        parentId: form.parentId || null,
      }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      showError('Navigasyon öğesi eklenemedi', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
      return
    }
    showSuccess('Navigasyon öğesi eklendi', 'Yeni navigasyon öğesi başarıyla oluşturuldu')
    setForm({ type: form.type, label: '', url: '/', parentId: '', order: 0 })
    load()
  }

  const saveEdit = async (id: string, data: Partial<NavItem>) => {
    const res = await fetch(`/api/admin/navigation/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: adminJsonHeaders(),
      body: JSON.stringify({
        type: data.type,
        label: data.label,
        url: data.url,
        order: data.order,
        parentId: data.parentId,
      }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      showError('Navigasyon öğesi güncellenemedi', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
      return
    }
    showSuccess('Navigasyon öğesi güncellendi', 'Değişiklikler başarıyla kaydedildi')
    setEditingId(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/admin/navigation/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: adminJsonHeaders(),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      showError('Navigasyon öğesi silinemedi', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
      return
    }
    showSuccess('Navigasyon öğesi silindi', 'Öğe başarıyla kaldırıldı')
    load()
  }

  const renderRow = (n: NavItem, depth = 0) => (
    <div key={n.id} className="space-y-2" style={{ marginLeft: depth * 16 }}>
      {editingId === n.id ? (
        <EditRow
          item={n}
          onSave={(d) => saveEdit(n.id, d)}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2 glass border border-primary/20 rounded-lg p-3">
          <span className="text-white font-medium">{n.label}</span>
          <span className="text-gray-400 text-sm">{n.url}</span>
          <span className="text-xs text-gray-500">{n.type}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(n.id)}>
            Düzenle
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => remove(n.id)}>
            Sil
          </Button>
        </div>
      )}
      {(n.children || []).map((c) => renderRow(c, depth + 1))}
    </div>
  )

  if (loading) return <p className="text-white">Yükleniyor…</p>

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-4xl font-bold text-white">Navigasyon</h1>

      <div className="glass border border-primary/20 rounded-lg p-6 space-y-3">
        <h2 className="text-lg text-white font-semibold">Yeni öğe</h2>
        <select
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as 'header' | 'footer' }))
          }
          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-primary/20 text-white"
        >
          <option value="header">Üst menü</option>
          <option value="footer">Alt menü</option>
        </select>
        <Input
          placeholder="Etiket"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          className="bg-black/20 border-primary/20 text-white"
        />
        <Input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          className="bg-black/20 border-primary/20 text-white"
        />
        <Input
          type="number"
          placeholder="Sıra"
          value={form.order}
          onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
          className="bg-black/20 border-primary/20 text-white"
        />
        <select
          value={form.parentId}
          onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-primary/20 text-white"
        >
          <option value="">Üst öğe yok</option>
          {flatParents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.type})
            </option>
          ))}
        </select>
        <Button type="button" onClick={create} disabled={!form.label.trim()}>
          Ekle
        </Button>
      </div>

      <div className="space-y-3">{items.map((n) => renderRow(n))}</div>
    </div>
  )
}

function EditRow({
  item,
  onSave,
  onCancel,
}: {
  item: NavItem
  onSave: (d: Partial<NavItem>) => void
  onCancel: () => void
}) {
  const [type, setType] = useState(item.type)
  const [label, setLabel] = useState(item.label)
  const [url, setUrl] = useState(item.url)
  const [order, setOrder] = useState(item.order)

  return (
    <div className="flex flex-col gap-2 glass border border-primary/30 rounded-lg p-3">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="px-3 py-2 rounded-lg bg-black/30 border border-primary/20 text-white"
      >
        <option value="header">header</option>
        <option value="footer">footer</option>
      </select>
      <Input value={label} onChange={(e) => setLabel(e.target.value)} className="text-white" />
      <Input value={url} onChange={(e) => setUrl(e.target.value)} className="text-white" />
      <Input
        type="number"
        value={order}
        onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
        className="text-white"
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onSave({ type, label, url, order, parentId: item.parentId })}>
          Kaydet
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </div>
  )
}
