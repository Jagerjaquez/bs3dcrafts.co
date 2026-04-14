'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminJsonHeaders, adminMultipartHeaders } from '@/lib/admin-client'
import { Trash2, Upload, Search, Filter, AlertTriangle, Calendar, FileImage } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import { MediaUploadModal } from '@/components/admin/media-upload-modal'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24'
      })
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      
      if (typeFilter) {
        params.append('type', typeFilter)
      }

      const res = await fetch(`/api/admin/media?${params.toString()}`, {
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
  }, [page, searchQuery, typeFilter])

  useEffect(() => {
    load()
  }, [load])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1) // Reset to first page when searching
      load()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, typeFilter])

  const onDelete = async (item: MediaRow) => {
    if (item.usageCount > 0) {
      if (!confirm(`Bu medya ${item.usageCount} yerde kullanılıyor. Silmek istediğinizden emin misiniz?`)) {
        return
      }
    } else {
      if (!confirm('Bu medyayı silmek istiyor musunuz?')) {
        return
      }
    }

    const res = await fetch(`/api/admin/media/${item.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: adminJsonHeaders(),
    })
    
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      showError('Medya silinemedi', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
      return
    }
    
    showSuccess('Medya silindi', 'Dosya başarıyla kaldırıldı')
    load()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    load()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-white">Medya Kütüphanesi</h1>
        <Button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Upload className="h-4 w-4 mr-2" />
          Dosya Yükle
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Dosya adına göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/20 border-primary/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-black/20 border-primary/20 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tür filtresi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm türler</SelectItem>
            <SelectItem value="image">Resimler</SelectItem>
            <SelectItem value="3d">3D Modeller</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>Toplam {total} dosya</span>
        {searchQuery && (
          <span>• "{searchQuery}" için {items.length} sonuç</span>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white">Yükleniyor...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileImage className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz medya yok'}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchQuery 
              ? 'Arama kriterlerinizi değiştirmeyi deneyin'
              : 'İlk medya dosyanızı yükleyerek başlayın'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Dosya Yükle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass border border-primary/20 rounded-lg overflow-hidden group relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Image */}
              <div className="aspect-square relative bg-black/40">
                <Image 
                  src={item.url} 
                  alt={item.filename} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
                
                {/* Usage warning overlay */}
                {item.usageCount > 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {item.usageCount}
                  </div>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="absolute top-2 right-2 p-1.5 rounded bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>

                {/* Metadata overlay on hover */}
                {hoveredItem === item.id && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col justify-center p-3 text-white text-xs space-y-1">
                    <div className="font-medium truncate">{item.filename}</div>
                    <div className="text-gray-300">
                      {item.dimensions && <div>Boyut: {item.dimensions}</div>}
                      <div>Dosya: {formatFileSize(item.size)}</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.uploadedAt)}
                      </div>
                      {item.usageCount > 0 && (
                        <div className="text-yellow-300">
                          {item.usageCount} yerde kullanılıyor
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Filename */}
              <div className="p-2 text-xs text-gray-300 truncate" title={item.filename}>
                {item.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 24 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-primary/20 text-white hover:bg-primary/20"
          >
            Önceki
          </Button>
          
          <span className="text-sm text-gray-400 px-4">
            Sayfa {page} / {Math.ceil(total / 24)}
          </span>
          
          <Button
            variant="outline"
            disabled={page * 24 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="border-primary/20 text-white hover:bg-primary/20"
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
