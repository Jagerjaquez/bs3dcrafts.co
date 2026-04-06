'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { adminJsonHeaders } from '@/lib/admin-client'

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
        alert('Toplu silme başarısız')
        return
      }
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
        alert('Toplu güncelleme başarısız')
        return
      }
      setSelected(new Set())
      router.refresh()
    } finally {
      setBusy(false)
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
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => bulkStatus('published')}>
            Yayınla
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => bulkStatus('draft')}>
            Taslak
          </Button>
          <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={bulkDelete}>
            Sil
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
              <tr key={product.id} className="border-t border-primary/20">
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
                <td className="p-4 text-white">{formatPrice(product.price)}</td>
                <td className="p-4">
                  <span className={product.stock <= 5 ? 'text-orange-500' : 'text-white'}>
                    {product.stock}
                  </span>
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
