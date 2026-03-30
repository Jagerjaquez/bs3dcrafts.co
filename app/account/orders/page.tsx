'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface Order {
  id: string
  customerName: string
  totalAmount: number
  status: string
  trackingNumber?: string
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    product: {
      id: string
      name: string
      slug: string
      media: Array<{ url: string }>
    }
  }>
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/orders')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }

    const statusLabels: Record<string, string> = {
      pending: 'Beklemede',
      paid: 'Ödendi',
      shipped: 'Kargoda',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← Hesabıma Dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({orders.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'paid'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ödendi ({orders.filter(o => o.status === 'paid').length})
            </button>
            <button
              onClick={() => setFilter('shipped')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'shipped'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kargoda ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'completed'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tamamlandı ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Henüz siparişiniz bulunmuyor' 
                : 'Bu kategoride sipariş bulunmuyor'}
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Sipariş #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        Kargo Takip: <span className="font-medium">{order.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {order.totalAmount.toFixed(2)} TL
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} ürün
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.product.media[0] && (
                            <img
                              src={item.product.media[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium text-gray-900 hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            Adet: {item.quantity} × {item.unitPrice.toFixed(2)} TL
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {(item.quantity * item.unitPrice).toFixed(2)} TL
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Detayları Gör
                  </Link>
                  {order.status === 'completed' && (
                    <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                      Tekrar Sipariş Ver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
