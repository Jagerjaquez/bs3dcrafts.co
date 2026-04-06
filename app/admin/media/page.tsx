'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { adminJsonHeaders, adminMultipartHeaders } from '@/lib/admin-client'
import { Trash2, Upload } from 'lucide-react'

type MediaRow = {
  id: string
  filename: string
  url: string
  type: string
  size: number
  dimensions: string | null
  usageCount: number
  uploadedAt: string
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media?page=${page}&limit=24`, {
        credentials: 'include',
      })
      const json = await res.json()
      if (res.ok && json.data) {
        setItems(json.data.media)
        setTotal(json.data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()
        fd.append('file', files[i])
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          credentials: 'include',
          headers: adminMultipartHeaders(),
          body: fd,
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          alert((d as { error?: string }).error || 'Yükleme hatası')
        }
      }
      load()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Bu medyayı silmek istiyor musunuz?')) return
    const res = await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: adminJsonHeaders(),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert((d as { error?: string }).error || 'Silinemedi')
      return
    }
    load()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-white">Medya kütüphanesi</h1>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={onUpload}
        />
        <Button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2 inline" />
          {uploading ? 'Yükleniyor…' : 'Yükle'}
        </Button>
      </div>
      <p className="text-gray-400 text-sm">Toplam {total} dosya</p>

      {loading ? (
        <p className="text-white">Yükleniyor…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((m) => (
            <div
              key={m.id}
              className="glass border border-primary/20 rounded-lg overflow-hidden group relative"
            >
              <div className="aspect-square relative bg-black/40">
                <Image src={m.url} alt={m.filename} fill className="object-cover" unoptimized />
              </div>
              <div className="p-2 text-xs text-gray-300 truncate">{m.filename}</div>
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="absolute top-2 right-2 p-1.5 rounded bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {total > 24 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            disabled={page * 24 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  )
}
