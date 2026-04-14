'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Eye, AlertTriangle } from 'lucide-react'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

export default function NewCmsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { showSuccess, showError } = useToast()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    status: 'draft' as 'draft' | 'published',
  })

  // Auto-generate slug from title
  useEffect(() => {
    if (form.title && !form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setForm(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [form.title, form.slug])

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
        showError('Sayfa oluşturulamadı', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
        return
      }
      showSuccess('Sayfa oluşturuldu', 'Yeni sayfa başarıyla eklendi')
      router.push('/admin/pages')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const createAndPublish = async () => {
    setSaving(true)
    try {
      const publishForm = { ...form, status: 'published' as const }
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify(publishForm),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        showError('Sayfa oluşturulamadı', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
        return
      }
      showSuccess('Sayfa oluşturuldu ve yayınlandı', 'Yeni sayfa başarıyla yayına alındı')
      router.push('/admin/pages')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const getMetaTitleLength = () => form.metaTitle.length
  const getMetaDescriptionLength = () => form.metaDescription.length

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Liste
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Yeni Sayfa</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? 'Düzenle' : 'Önizle'}
        </Button>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="glass border border-primary/20 rounded-lg p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">{form.title || 'Başlık girilmedi'}</h1>
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: form.content || '<p>İçerik henüz eklenmedi.</p>' }}
            />
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={submit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sayfa Başlığı *
                </label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="text-white bg-black/20"
                  placeholder="Sayfa başlığını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug *
                </label>
                <Input
                  required
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    }))
                  }
                  className="text-white bg-black/20 font-mono"
                  placeholder="url-slug"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Sayfa URL'si: /sayfa/{form.slug || 'slug'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durum
                </label>
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
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">İçerik</h2>
            <RichTextEditor
              content={form.content}
              onChange={(content) => setForm((f) => ({ ...f, content }))}
              placeholder="Sayfa içeriğini buraya yazın..."
            />
          </div>

          {/* SEO Settings */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">SEO Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Başlık
                  <span className={`ml-2 text-xs ${
                    getMetaTitleLength() > 60 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    ({getMetaTitleLength()}/60)
                  </span>
                </label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                  className={`text-white bg-black/20 ${
                    getMetaTitleLength() > 60 ? 'border-red-500/50' : ''
                  }`}
                  placeholder="Arama motorları için başlık"
                />
                {getMetaTitleLength() > 60 && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Önerilen uzunluk 60 karakterdir</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Açıklama
                  <span className={`ml-2 text-xs ${
                    getMetaDescriptionLength() > 160 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    ({getMetaDescriptionLength()}/160)
                  </span>
                </label>
                <Input
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  className={`text-white bg-black/20 ${
                    getMetaDescriptionLength() > 160 ? 'border-red-500/50' : ''
                  }`}
                  placeholder="Arama motorları için açıklama"
                />
                {getMetaDescriptionLength() > 160 && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Önerilen uzunluk 160 karakterdir</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Anahtar Kelimeler
                </label>
                <Input
                  value={form.keywords}
                  onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                  className="text-white bg-black/20"
                  placeholder="kelime1, kelime2, kelime3"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Virgülle ayırarak yazın
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Oluşturuluyor…' : 'Taslak Olarak Kaydet'}
            </Button>
            <Button 
              type="button" 
              variant="default"
              onClick={createAndPublish}
              disabled={saving}
            >
              Oluştur ve Yayınla
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
