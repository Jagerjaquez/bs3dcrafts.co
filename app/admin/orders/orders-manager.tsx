'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { adminJsonHeaders } from '@/lib/admin-client'
import { Button } from '@/components/ui/button'

type ProductLite = { id: string; name: string; slug: string }
type OrderItem = {
  id: string
  quantity: number
  unitPrice: number
  product: ProductLite
}
export type OrderRow = {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  totalAmount: number
  status: string
  trackingNumber: string | null
  createdAt: string
  items: OrderItem[]
}

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const

export default function OrdersManager({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders)
  const [savingId, setSavingId] = useState<string | null>(null)

  const updateLocal = (id: string, patch: Partial<OrderRow>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const saveOrder = async (order: OrderRow) => {
    setSavingId(order.id)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          status: order.status,
          trackingNumber: order.trackingNumber ?? '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert((data as { error?: string }).error || 'Güncelleme başarısız')
        return
      }
      updateLocal(order.id, {
        status: data.status,
        trackingNumber: data.trackingNumber ?? null,
      })
    } catch {
      alert('Bağlantı hatası')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Siparişler</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="glass border border-primary/20 rounded-lg p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="font-semibold text-lg text-white">{order.customerName}</p>
                <p className="text-sm text-gray-300">{order.email}</p>
                <p className="text-sm text-gray-300">{order.phone}</p>
                <p className="text-xs text-gray-500 mt-1">
                  #{order.id.slice(0, 8)}…{' '}
                  <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline ml-1">
                    Detay
                  </Link>
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end border-t border-primary/20 pt-4">
              <div className="space-y-1 flex-1">
                <label className="text-xs text-gray-400">Durum</label>
                <select
                  value={order.status}
                  onChange={(e) => updateLocal(order.id, { status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-primary/20 text-white text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs text-gray-400">Kargo takip no</label>
                <input
                  type="text"
                  value={order.trackingNumber ?? ''}
                  onChange={(e) => updateLocal(order.id, { trackingNumber: e.target.value })}
                  placeholder="Opsiyonel"
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-primary/20 text-white text-sm"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={savingId === order.id}
                onClick={() => saveOrder(order)}
              >
                {savingId === order.id ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            </div>

            <div className="border-t border-primary/20 pt-4">
              <p className="text-sm text-gray-400 mb-2">Ürünler:</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-300">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-white">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-primary/20 pt-4">
              <p className="text-sm text-gray-400">Adres:</p>
              <p className="text-sm text-gray-300">{order.address}</p>
            </div>

            <div className="text-xs text-gray-400">
              Sipariş tarihi: {formatDate(order.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
