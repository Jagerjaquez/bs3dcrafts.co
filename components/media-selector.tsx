'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type MediaRow = {
  id: string
  filename: string
  url: string
}

type ListPayload = {
  success?: boolean
  data?: { media: MediaRow[]; total: number; page: number; limit: number; totalPages: number }
}

export function MediaSelector(props: {
  open: boolean
  onClose: () => void
  onPick: (url: string) => void
  fetchHeaders?: HeadersInit
}) {
  const { open, onClose, onPick, fetchHeaders } = props
  const [items, setItems] = useState<MediaRow[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setPage(1)
  }, [open])

  const load = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/media?page=${page}&limit=30`, {
        credentials: 'include',
        headers: fetchHeaders,
      })
      const json: ListPayload = await res.json()
      if (json.data?.media) {
        setItems(json.data.media)
        setTotalPages(json.data.totalPages || 1)
      }
    } finally {
      setLoading(false)
    }
  }, [open, page, fetchHeaders])

  useEffect(() => {
    load()
  }, [load])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass border border-primary/30 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <h2 className="text-lg font-semibold text-white">Medya seç</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-primary/10" aria-label="Kapat">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-gray-400">Yükleniyor…</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onPick(m.url)
                    onClose()
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/50 transition-colors"
                >
                  <Image src={m.url} alt={m.filename} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between p-4 border-t border-primary/20">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Önceki
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  )
}
