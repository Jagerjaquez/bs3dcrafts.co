'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { adminJsonHeaders } from '@/lib/admin-client'

export default function NewCmsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    status: 'draft' as 'draft' | 'published',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify(form),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert((d as { error?: string }).error || 'Kayıt başarısız')
        return
      }
      router.push('/admin/pages')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/pages">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Liste
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Yeni sayfa</h1>
      </div>
      <form onSubmit={submit} className="space-y-4 glass border border-primary/20 rounded-lg p-6">
        <Input
          placeholder="Başlık"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="text-white bg-black/20"
        />
        <Input
          placeholder="slug-ornek"
          required
          value={form.slug}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            }))
          }
          className="text-white bg-black/20"
        />
        <Textarea
          placeholder="HTML içerik"
          required
          rows={14}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="text-white bg-black/20 font-mono text-sm"
        />
        <Input
          placeholder="Meta başlık"
          value={form.metaTitle}
          onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
          className="text-white bg-black/20"
        />
        <Input
          placeholder="Meta açıklama"
          value={form.metaDescription}
          onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
          className="text-white bg-black/20"
        />
        <Input
          placeholder="Anahtar kelimeler (virgülle)"
          value={form.keywords}
          onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
          className="text-white bg-black/20"
        />
        <select
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))
          }
          className="w-full px-3 py-2 rounded-lg bg-black/30 border border-primary/20 text-white"
        >
          <option value="draft">Taslak</option>
          <option value="published">Yayında</option>
        </select>
        <Button type="submit" disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Oluştur'}
        </Button>
      </form>
    </div>
  )
}
