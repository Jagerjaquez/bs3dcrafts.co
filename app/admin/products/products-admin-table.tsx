'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit2, Check, X } from 'lucide-react'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'

type ProductRow = {
  id: string
  name: string
  slug: string
  category: string
  price: number
  stock: number
  status: string
  media: { url: string }[]
}

export default function ProductsAdminTable({ initial }: { initial: ProductRow[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, { price?: string; stock?: string }>>({})
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const { showSuccess, showError } = useToast()

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    if (selected.size === initial.length) setSelected(new Set())
    else setSelected(new Set(initial.map((p) => p.id)))
  }

  const bulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`${selected.size} ürün silinsin mi?`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ ids: [...selected] }),
      })
      if (!res.ok) {
        showError('Toplu silme başarısız', 'Seçili ürünler silinemedi')
        return
      }
      showSuccess('Ürünler silindi', `${selected.size} ürün başarıyla silindi`)
      setSelected(new Set())
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const bulkStatus = async (status: 'draft' | 'published') => {
    if (selected.size === 0) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ ids: [...selected], data: { status } }),
      })
      if (!res.ok) {
        showError('Toplu güncelleme başarısız', 'Seçili ürünlerin durumu güncellenemedi')
        return
      }
      const statusText = status === 'published' ? 'yayınlandı' : 'taslak yapıldı'
      showSuccess('Ürün durumu güncellendi', `${selected.size} ürün ${statusText}`)
      setSelected(new Set())
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const bulkCategory = async (category: string) => {
    if (selected.size === 0) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ ids: [...selected], data: { category } }),
      })
      if (!res.ok) {
        showError('Toplu güncelleme başarısız', 'Seçili ürünlerin kategorisi güncellenemedi')
        return
      }
      showSuccess('Kategori güncellendi', `${selected.size} ürünün kategorisi "${category}" olarak güncellendi`)
      setSelected(new Set())
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (productId: string, field: 'price' | 'stock', currentValue: number) => {
    if (field === 'price') {
      setEditingPrice(productId)
      setEditValues(prev => ({ ...prev, [productId]: { ...prev[productId], price: currentValue.toString() } }))
    } else {
      setEditingStock(productId)
      setEditValues(prev => ({ ...prev, [productId]: { ...prev[productId], stock: currentValue.toString() } }))
    }
  }

  const cancelEdit = (productId: string, field: 'price' | 'stock') => {
    if (field === 'price') {
      setEditingPrice(null)
    } else {
      setEditingStock(null)
    }
    setEditValues(prev => {
      const newValues = { ...prev }
      if (newValues[productId]) {
        delete newValues[productId][field]
        if (Object.keys(newValues[productId]).length === 0) {
          delete newValues[productId]
        }
      }
      return newValues
    })
  }

  const saveEdit = async (productId: string, field: 'price' | 'stock') => {
    const value = editValues[productId]?.[field]
    if (!value) return

    setSaving(prev => new Set([...prev, productId]))
    
    try {
      const updateData = field === 'price' 
        ? { price: parseFloat(value) }
        : { stock: parseInt(value) }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        showSuccess('Güncellendi', `${field === 'price' ? 'Fiyat' : 'Stok'} başarıyla güncellendi`)
        if (field === 'price') {
          setEditingPrice(null)
        } else {
          setEditingStock(null)
        }
        setEditValues(prev => {
          const newValues = { ...prev }
          if (newValues[productId]) {
            delete newValues[productId][field]
            if (Object.keys(newValues[productId]).length === 0) {
              delete newValues[productId]
            }
          }
          return newValues
        })
        router.refresh()
      } else {
        const errorData = await response.json()
        showError('Güncelleme başarısız', errorData.error || 'Bilinmeyen hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      showError('Bağlantı hatası', 'Sunucuya bağlanılamadı')
    } finally {
      setSaving(prev => {
        const newSaving = new Set(prev)
        newSaving.delete(productId)
        return newSaving
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-white">Ürünler</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 glass border border-primary/30 rounded-lg p-3">
          <span className="text-sm text-gray-300">{selected.size} seçili</span>
          
          {/* Status Actions */}
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => bulkStatus('published')}>
            Yayınla
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => bulkStatus('draft')}>
            Taslak
          </Button>
          
          {/* Category Actions */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                bulkCategory(e.target.value)
                e.target.value = ''
              }
            }}
            disabled={busy}
            className="px-3 py-1 text-sm bg-black/20 border border-primary/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Kategori Değiştir</option>
            <option value="Dekorasyon">Dekorasyon</option>
            <option value="Aksesuar">Aksesuar</option>
            <option value="Oyuncak">Oyuncak</option>
            <option value="Ev & Yaşam">Ev & Yaşam</option>
          </select>
          
          {/* Delete Action */}
          <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={bulkDelete}>
            {busy ? 'İşleniyor...' : 'Sil'}
          </Button>
        </div>
      )}

      <div className="glass border border-primary/20 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary/10">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={initial.length > 0 && selected.size === initial.length}
                  onChange={toggleAll}
                  aria-label="Tümünü seç"
                />
              </th>
              <th className="text-left p-4 text-white">Ürün</th>
              <th className="text-left p-4 text-white">Kategori</th>
              <th className="text-left p-4 text-white">Durum</th>
              <th className="text-left p-4 text-white">Fiyat</th>
              <th className="text-left p-4 text-white">Stok</th>
              <th className="text-left p-4 text-white">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((product) => (
              <tr key={product.id} className="border-t border-primary/20 group hover:bg-primary/5">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggle(product.id)}
                    aria-label={product.name}
                  />
                </td>
                <td className="p-4">
                  <div className="font-semibold text-white">{product.name}</div>
                  <div className="text-sm text-gray-400">{product.slug}</div>
                </td>
                <td className="p-4 text-gray-300">{product.category}</td>
                <td className="p-4 text-gray-300 text-sm">{product.status}</td>
                <td className="p-4">
                  {editingPrice === product.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues[product.id]?.price || ''}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          [product.id]: { ...prev[product.id], price: e.target.value }
                        }))}
                        className="w-24 h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveEdit(product.id, 'price')}
                        disabled={saving.has(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelEdit(product.id, 'price')}
                        disabled={saving.has(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white">{formatPrice(product.price)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(product.id, 'price', product.price)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {editingStock === product.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValues[product.id]?.stock || ''}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          [product.id]: { ...prev[product.id], stock: e.target.value }
                        }))}
                        className="w-20 h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveEdit(product.id, 'stock')}
                        disabled={saving.has(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelEdit(product.id, 'stock')}
                        disabled={saving.has(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={product.stock <= 5 ? 'text-orange-500' : 'text-white'}>
                        {product.stock}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(product.id, 'stock', product.stock)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm">
                      Düzenle
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
