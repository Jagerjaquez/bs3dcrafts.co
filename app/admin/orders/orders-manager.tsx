'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { adminJsonHeaders } from '@/lib/admin-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/contexts/toast-context'

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

type OrderStats = {
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<string, number>
}

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const
const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoya Verildi',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi'
}

export default function OrdersManager({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders)
  const [filteredOrders, setFilteredOrders] = useState<OrderRow[]>(initialOrders)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState<OrderStats | null>(null)
  const { showSuccess, showError } = useToast()

  // Calculate statistics
  useEffect(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({
      totalRevenue,
      averageOrderValue,
      ordersByStatus
    })
  }, [orders])

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const updateLocal = (id: string, patch: Partial<OrderRow>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const saveOrder = async (order: OrderRow) => {
    // Validate tracking number for shipped status
    if (order.status === 'shipped' && !order.trackingNumber?.trim()) {
      showError('Doğrulama Hatası', 'Kargoya verilen siparişler için takip numarası gereklidir')
      return
    }

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
        showError('Güncelleme başarısız', (data as { error?: string }).error || 'Sipariş durumu güncellenemedi')
        return
      }
      updateLocal(order.id, {
        status: data.status,
        trackingNumber: data.trackingNumber ?? null,
      })
      showSuccess('Sipariş güncellendi', 'Sipariş durumu başarıyla kaydedildi ve müşteriye bildirim gönderildi')
    } catch {
      showError('Bağlantı hatası', 'Sunucuya bağlanılamadı')
    } finally {
      setSavingId(null)
    }
  }

  const generateInvoice = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        showError('Fatura Hatası', 'Fatura oluşturulamadı')
        return
      }

      // Create download link
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fatura-${orderId.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showSuccess('Fatura İndirildi', 'Fatura başarıyla oluşturuldu ve indirildi')
    } catch {
      showError('Fatura Hatası', 'Fatura indirilemedi')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Siparişler</h1>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Toplam Gelir</h3>
            <p className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
          </div>
          <div className="glass border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Ortalama Sipariş Değeri</h3>
            <p className="text-2xl font-bold text-white">{formatPrice(stats.averageOrderValue)}</p>
          </div>
          <div className="glass border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Toplam Sipariş</h3>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
        </div>
      )}

      {/* Status breakdown */}
      {stats && (
        <div className="glass border border-primary/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Durum Dağılımı</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {STATUSES.map(status => (
              <div key={status} className="text-center">
                <p className="text-sm text-gray-400">{STATUS_LABELS[status]}</p>
                <p className="text-xl font-bold text-white">{stats.ordersByStatus[status] || 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass border border-primary/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Arama (Müşteri adı, e-posta, sipariş ID)</label>
            <Input
              type="text"
              placeholder="Arama yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Durum Filtresi</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-black/20 border-primary/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="glass border border-primary/20 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' ? 'Filtrelere uygun sipariş bulunamadı' : 'Henüz sipariş bulunmuyor'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
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
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateInvoice(order.id)}
                      className="text-xs"
                    >
                      Fatura İndir
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-end border-t border-primary/20 pt-4">
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-gray-400">Durum</label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateLocal(order.id, { status: value })}
                  >
                    <SelectTrigger className="bg-black/30 border-primary/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-gray-400">
                    Kargo takip no {order.status === 'shipped' && <span className="text-red-400">*</span>}
                  </label>
                  <Input
                    type="text"
                    value={order.trackingNumber ?? ''}
                    onChange={(e) => updateLocal(order.id, { trackingNumber: e.target.value })}
                    placeholder={order.status === 'shipped' ? 'Gerekli' : 'Opsiyonel'}
                    className="bg-black/30 border-primary/20 text-white"
                    required={order.status === 'shipped'}
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

              <div className="flex justify-between items-center text-xs text-gray-400 border-t border-primary/20 pt-4">
                <span>Sipariş tarihi: {formatDate(order.createdAt)}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                  order.status === 'paid' ? 'bg-yellow-500/20 text-yellow-400' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
