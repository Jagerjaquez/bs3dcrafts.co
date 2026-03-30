'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setImages(prev => [...prev, data.url])
        } else {
          const errorData = await response.json()
          alert('Fotoğraf yüklenirken hata oluştu: ' + (errorData.error || 'Bilinmeyen hata'))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
          stock: parseInt(formData.stock),
          weight: parseFloat(formData.weight),
          images: images,
        }),
      })

      if (response.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const errorData = await response.json()
        alert('Ürün eklenirken hata oluştu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if admin secret exists in session storage
    const adminSecret = sessionStorage.getItem('adminSecret')
    if (!adminSecret) {
      // Redirect to login page instead of prompting
      alert('Lütfen önce admin girişi yapın.')
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Admin girişi kontrol ediliyor...</p>
        </div>
      </div>
    )
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
          
          {/* Upload Button */}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-lg transition-colors">
                <Upload className="h-4 w-4 text-white" />
                <span className="text-sm text-white">
                  {uploadingImage ? 'Yükleniyor...' : 'Fotoğraf Seç'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-400">
              {images.length} fotoğraf yüklendi
            </span>
          </div>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                    <Image
                      src={url}
                      alt={`Product ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/80 rounded text-xs text-white">
                      Ana Fotoğraf
                    </div>
                  )}
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
