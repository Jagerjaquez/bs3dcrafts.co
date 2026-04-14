'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Upload, Check, FileImage } from 'lucide-react'
import { MediaUploadModal } from './media-upload-modal'

export interface MediaItem {
  id: string
  filename: string
  url: string
  type: string
  size: number
  dimensions: string | null
  usageCount: number
  uploadedAt: string
}

interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaItem | MediaItem[]) => void
  multiple?: boolean
  selectedIds?: string[]
  title?: string
}

export function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = 'Medya Seç'
}: MediaSelectorProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedIds)
  const [showUploadModal, setShowUploadModal] = useState(false)

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
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, typeFilter])

  useEffect(() => {
    if (isOpen) {
      load()
    }
  }, [isOpen, load])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1) // Reset to first page when searching
      if (isOpen) {
        load()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, typeFilter, isOpen, load])

  const toggleSelection = (item: MediaItem) => {
    if (multiple) {
      setSelectedItems(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(id => id !== item.id)
        } else {
          return [...prev, item.id]
        }
      })
    } else {
      setSelectedItems([item.id])
    }
  }

  const handleSelect = () => {
    const selectedMedia = items.filter(item => selectedItems.includes(item.id))
    
    if (selectedMedia.length === 0) return

    if (multiple) {
      onSelect(selectedMedia)
    } else {
      onSelect(selectedMedia[0])
    }
    
    handleClose()
  }

  const handleClose = () => {
    setSelectedItems(selectedIds)
    setSearchQuery('')
    setTypeFilter('')
    setPage(1)
    onClose()
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
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
      day: 'numeric'
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">{title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
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

              <Button
                onClick={() => setShowUploadModal(true)}
                variant="outline"
                className="border-primary/20 text-white hover:bg-primary/20"
              >
                <Upload className="h-4 w-4 mr-2" />
                Yükle
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                Toplam {total} dosya
                {searchQuery && ` • "${searchQuery}" için ${items.length} sonuç`}
              </span>
              {selectedItems.length > 0 && (
                <span className="text-primary">
                  {selectedItems.length} dosya seçildi
                </span>
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
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item) => {
                  const isSelected = selectedItems.includes(item.id)
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:border-primary/50'
                      }`}
                      onClick={() => toggleSelection(item)}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 bg-primary text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {/* Image */}
                      <div className="aspect-square relative bg-black/40">
                        <Image 
                          src={item.url} 
                          alt={item.filename} 
                          fill 
                          className="object-cover" 
                          unoptimized 
                        />
                      </div>

                      {/* Info */}
                      <div className="p-2 bg-black/60">
                        <div className="text-xs text-white truncate" title={item.filename}>
                          {item.filename}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.dimensions && <div>{item.dimensions}</div>}
                          <div className="flex items-center justify-between">
                            <span>{formatFileSize(item.size)}</span>
                            <span>{formatDate(item.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {total > 24 && (
              <div className="flex items-center justify-center gap-2 pt-4">
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              {multiple ? 'Birden fazla dosya seçebilirsiniz' : 'Tek dosya seçebilirsiniz'}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                İptal
              </Button>
              
              <Button
                onClick={handleSelect}
                disabled={selectedItems.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {selectedItems.length === 0 
                  ? 'Dosya Seç'
                  : multiple 
                    ? `${selectedItems.length} Dosyayı Seç`
                    : 'Seç'
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  )
}