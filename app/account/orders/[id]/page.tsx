'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface OrderDetail {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  totalAmount: number
  status: string
  trackingNumber?: string
  stripePaymentId?: string
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

export default function OrderDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/orders')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && orderId) {
      fetchOrder()
    }
  }, [user, orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/user/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
      } else {
        setError('Sipariş bulunamadı')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
      setError('Sipariş yüklenirken bir hata oluştu')
    } finally {
      setLoadingOrder(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusInfo: Record<string, { label: string; color: string; description: string }> = {
      pending: {
        label: 'Beklemede',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Siparişiniz işleme alınıyor',
      },
      paid: {
        label: 'Ödendi',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Ödemeniz alındı, siparişiniz hazırlanıyor',
      },
      shipped: {
        label: 'Kargoda',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Siparişiniz kargoya verildi',
      },
      completed: {
        label: 'Tamamlandı',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Siparişiniz teslim edildi',
      },
      cancelled: {
        label: 'İptal Edildi',
        color: 'bg-red-100 text-red-800 border-red-200',
        description: 'Sipariş iptal edildi',
      },
    }

    return statusInfo[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: '',
    }
  }

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-red-600 mb-4">{error || 'Sipariş bulunamadı'}</p>
            <Link
              href="/account/orders"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
              Siparişlerime Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account/orders" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← Siparişlerime Dön
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Sipariş #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span className={`px-4 py-2 text-sm font-medium rounded-full border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{statusInfo.description}</p>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Durumu</h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`h-2 rounded-full ${order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <p className="mt-2 text-xs text-gray-600">Sipariş Alındı</p>
            </div>
            <div className="flex-1 ml-2">
              <div className={`h-2 rounded-full ${['paid', 'shipped', 'completed'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <p className="mt-2 text-xs text-gray-600">Ödeme Alındı</p>
            </div>
            <div className="flex-1 ml-2">
              <div className={`h-2 rounded-full ${['shipped', 'completed'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <p className="mt-2 text-xs text-gray-600">Kargoya Verildi</p>
            </div>
            <div className="flex-1 ml-2">
              <div className={`h-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <p className="mt-2 text-xs text-gray-600">Teslim Edildi</p>
            </div>
          </div>
        </div>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Kargo Takip Numarası</p>
                <p className="text-lg font-bold text-blue-900 mt-1">{order.trackingNumber}</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-900 bg-white border border-blue-300 rounded-md hover:bg-blue-50">
                Kargoyu Takip Et
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Detayları</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
                      <p className="text-sm text-gray-500 mt-1">
                        Adet: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Birim Fiyat: {item.unitPrice.toFixed(2)} TL
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {(item.quantity * item.unitPrice).toFixed(2)} TL
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Özeti</h2>
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Ara Toplam</dt>
                  <dd className="text-gray-900">{subtotal.toFixed(2)} TL</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Kargo</dt>
                  <dd className="text-gray-900">Ücretsiz</dd>
                </div>
                <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                  <dt className="text-gray-900">Toplam</dt>
                  <dd className="text-gray-900">{order.totalAmount.toFixed(2)} TL</dd>
                </div>
              </dl>
            </div>

            {/* Delivery Address */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Teslimat Adresi</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p>{order.address}</p>
                <p className="pt-2">{order.phone}</p>
                <p>{order.email}</p>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Bilgileri</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-600">Sipariş Tarihi</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                {order.stripePaymentId && (
                  <div>
                    <dt className="text-gray-600">Ödeme ID</dt>
                    <dd className="text-gray-900 mt-1 font-mono text-xs">
                      {order.stripePaymentId}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Fatura İndir
          </button>
          {order.status === 'completed' && (
            <button className="px-6 py-3 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
              Tekrar Sipariş Ver
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
