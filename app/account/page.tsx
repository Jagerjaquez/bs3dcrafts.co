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

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account')
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

  const handleLogout = async () => {
    await logout()
    router.push('/')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
              <p className="mt-1 text-sm text-gray-600">
                Hoş geldiniz, {user.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white shadow rounded-lg p-4 space-y-1">
              <Link
                href="/account"
                className="block px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-md"
              >
                Genel Bakış
              </Link>
              <Link
                href="/account/orders"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Siparişlerim
              </Link>
              <Link
                href="/account/addresses"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Adreslerim
              </Link>
              <Link
                href="/account/profile"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Profil Bilgileri
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                {user.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Üyelik Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Son Siparişler</h2>
                <Link
                  href="/account/orders"
                  className="text-sm font-medium text-black hover:underline"
                >
                  Tümünü Gör →
                </Link>
              </div>

              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Henüz siparişiniz bulunmuyor</p>
                  <Link
                    href="/products"
                    className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            Sipariş #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {order.totalAmount.toFixed(2)} TL
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="w-12 h-12 bg-gray-100 rounded overflow-hidden"
                            >
                              {item.product.media[0] && (
                                <img
                                  src={item.product.media[0].url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-sm text-gray-500">
                              +{order.items.length - 3} ürün
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-sm font-medium text-black hover:underline"
                        >
                          Detaylar →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
