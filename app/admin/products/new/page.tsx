'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, AlertTriangle, GripVertical } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { adminJsonHeaders, adminMultipartHeaders } from '@/lib/admin-client'
import { MediaSelector } from '@/components/media-selector'
import { useToast } from '@/contexts/toast-context'
import { useDropzone } from 'react-dropzone'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const { showSuccess, showError } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discountedPrice: '',
    stock: '',
    category: 'Dekorasyon',
    material: 'PLA',
    printTimeEstimate: '',
    weight: '',
    featured: false,
    status: 'published' as 'draft' | 'published',
  })

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return

    setUploadingImage(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileId = `${file.name}-${Date.now()}`
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          headers: adminMultipartHeaders(),
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setImages(prev => [...prev, data.url])
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        } else {
          const errorData = await response.json()
          showError(`${file.name} yüklenemedi`, errorData.error || 'Bilinmeyen hata oluştu')
        }

        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      showError('Bağlantı hatası', 'Sunucuya bağlanılamadı')
    } finally {
      setUploadingImage(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleImageUpload(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await handleImageUpload(Array.from(files))
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
          stock: parseInt(formData.stock),
          weight: parseFloat(formData.weight),
          images: images,
          status: formData.status,
        }),
      })

      if (response.ok) {
        showSuccess('Ürün eklendi', 'Yeni ürün başarıyla oluşturuldu')
        router.push('/admin/products')
        router.refresh()
      } else {
        const errorData = await response.json()
        showError('Ürün eklenemedi', errorData.error || 'Bilinmeyen hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      showError('Bağlantı hatası', 'Sunucuya bağlanılamadı')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-white">Yeni Ürün Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="glass border border-primary/20 rounded-lg p-8 space-y-6">
        {/* Fotoğraf Yükleme */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-white">Ürün Fotoğrafları</label>
          
          {/* Drag-Drop Upload Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-white">Fotoğrafları buraya bırakın...</p>
            ) : (
              <div>
                <p className="text-white mb-2">Fotoğrafları buraya sürükleyin veya tıklayın</p>
                <p className="text-sm text-gray-400">JPEG, PNG, WebP, GIF - Maksimum 5MB</p>
              </div>
            )}
          </div>

          {/* Alternative Upload Methods */}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-lg transition-colors">
                <Upload className="h-4 w-4 text-white" />
                <span className="text-sm text-white">
                  {uploadingImage ? 'Yükleniyor...' : 'Dosya Seç'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => setMediaPickerOpen(true)}>
              Kütüphaneden seç
            </Button>
            <span className="text-sm text-gray-400">
              {images.length} fotoğraf yüklendi
            </span>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{progress}%</span>
                </div>
              ))}
            </div>
          )}

          <MediaSelector
            open={mediaPickerOpen}
            onClose={() => setMediaPickerOpen(false)}
            onPick={(url) => setImages((prev) => [...prev, url])}
          />

          {/* Image Preview Grid with Drag-Drop Reordering */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={`${url}-${index}`} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                    <Image
                      src={url}
                      alt={`Product ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 p-1 bg-black/50 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  
                  {/* Main Image Indicator */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/80 rounded text-xs text-white">
                      Ana Fotoğraf
                    </div>
                  )}
                  
                  {/* Reorder Buttons */}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1 bg-black/50 rounded text-xs text-white hover:bg-black/70"
                        title="Sola taşı"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1 bg-black/50 rounded text-xs text-white hover:bg-black/70"
                        title="Sağa taşı"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Henüz fotoğraf eklenmedi</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ürün Adı */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ürün Adı *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                })
              }}
              placeholder="Geometrik Vazo"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Slug (URL) *</label>
            <Input
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="geometrik-vazo"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Kategori *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-black/20 border border-primary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Dekorasyon">Dekorasyon</option>
              <option value="Aksesuar">Aksesuar</option>
              <option value="Oyuncak">Oyuncak</option>
              <option value="Ev & Yaşam">Ev & Yaşam</option>
            </select>
          </div>

          {/* Malzeme */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Malzeme *</label>
            <select
              required
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full px-4 py-2 bg-black/20 border border-primary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PLA">PLA</option>
              <option value="PETG">PETG</option>
              <option value="ABS">ABS</option>
              <option value="TPU">TPU</option>
            </select>
          </div>

          {/* Yayın Durumu */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Yayın Durumu *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-4 py-2 bg-black/20 border border-primary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
            </select>
          </div>

          {/* Fiyat */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Fiyat (₺) *</label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="299.99"
            />
          </div>

          {/* İndirimli Fiyat */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">İndirimli Fiyat (₺)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
              placeholder="249.99"
            />
          </div>

          {/* Stok */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Stok Miktarı *</label>
            <Input
              required
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="15"
            />
            {parseInt(formData.stock) > 0 && parseInt(formData.stock) <= 5 && (
              <div className="flex items-center gap-2 text-orange-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Düşük stok uyarısı! Stok 5 ve altında.</span>
              </div>
            )}
          </div>

          {/* Ağırlık */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ağırlık (gram) *</label>
            <Input
              required
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="250"
            />
          </div>

          {/* Üretim Süresi */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white">Üretim Süresi *</label>
            <Input
              required
              value={formData.printTimeEstimate}
              onChange={(e) => setFormData({ ...formData, printTimeEstimate: e.target.value })}
              placeholder="8-10 saat"
            />
          </div>
        </div>

        {/* Açıklama */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Açıklama *</label>
          <Textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ürün açıklaması..."
            rows={4}
          />
        </div>

        {/* Öne Çıkan */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 rounded border-primary/20 bg-black/20 text-primary focus:ring-primary"
          />
          <label htmlFor="featured" className="text-sm text-white cursor-pointer">
            Öne çıkan ürün olarak işaretle
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
          </Button>
          <Link href="/admin/products" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
