'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  }, [id, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProduct()
    }
  }, [isAuthenticated])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${id}`)
      if (response.ok) {
        const product = await response.json()
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          discountedPrice: product.discountedPrice?.toString() || '',
          stock: product.stock.toString(),
          category: product.category,
          material: product.material,
          printTimeEstimate: product.printTimeEstimate,
          weight: product.weight.toString(),
          featured: product.featured,
        })
      } else {
        const errorData = await response.json()
        alert('Ürün yüklenirken hata oluştu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
          stock: parseInt(formData.stock),
          weight: parseFloat(formData.weight),
        }),
      })

      if (response.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const errorData = await response.json()
        alert('Ürün güncellenirken hata oluştu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const errorData = await response.json()
        alert('Ürün silinirken hata oluştu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white">Ürünü Düzenle</h1>
        </div>
        <Button variant="outline" onClick={handleDelete} className="text-red-500 border-red-500 hover:bg-red-500/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Sil
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="glass border border-primary/20 rounded-lg p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ürün Adı */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ürün Adı *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <Button type="submit" disabled={saving} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
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
