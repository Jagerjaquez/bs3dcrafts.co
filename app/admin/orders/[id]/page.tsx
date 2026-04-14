import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import OrderDetailManager from './order-detail-manager'

type Props = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })
  if (!order) notFound()

  // Create order timeline based on status and dates
  const timeline = [
    {
      status: 'pending',
      label: 'Sipariş Alındı',
      date: order.createdAt,
      completed: true
    },
    {
      status: 'paid',
      label: 'Ödeme Alındı',
      date: order.status !== 'pending' ? order.updatedAt : null,
      completed: ['paid', 'shipped', 'completed'].includes(order.status)
    },
    {
      status: 'shipped',
      label: 'Kargoya Verildi',
      date: order.status === 'shipped' || order.status === 'completed' ? order.updatedAt : null,
      completed: ['shipped', 'completed'].includes(order.status)
    },
    {
      status: 'completed',
      label: 'Teslim Edildi',
      date: order.status === 'completed' ? order.updatedAt : null,
      completed: order.status === 'completed'
    }
  ]

  const orderData = JSON.parse(JSON.stringify(order))

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Siparişler
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Sipariş Detayı</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Müşteri Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <p className="text-sm text-gray-500">Ad Soyad</p>
                <p className="font-medium text-white">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-posta</p>
                <p className="font-medium text-white">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium text-white">{order.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sipariş ID</p>
                <p className="font-medium text-white">#{order.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Teslimat Adresi</h2>
            <p className="text-gray-300 leading-relaxed">{order.address}</p>
          </div>

          {/* Order Items */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sipariş Kalemleri</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-primary/10 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.product.name}</h3>
                    <p className="text-sm text-gray-400">
                      Birim fiyat: {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Order Total */}
              <div className="border-t border-primary/20 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Toplam</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sipariş Durumu</h2>
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <div key={step.status} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-600 text-gray-400'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-sm text-gray-500">
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Status Update Form */}
          <OrderDetailManager order={orderData} />

          {/* Quick Actions */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Hızlı İşlemler</h2>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  // This will be handled by the OrderDetailManager component
                  const event = new CustomEvent('generateInvoice', { detail: { orderId: order.id } })
                  window.dispatchEvent(event)
                }}
              >
                Fatura Oluştur
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(order.id)
                }}
              >
                Sipariş ID'sini Kopyala
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  window.open(`mailto:${order.email}?subject=Sipariş Hakkında - ${order.id.slice(0, 8)}`)
                }}
              >
                Müşteriyle İletişim
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass border border-primary/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sipariş Tarihi:</span>
                <span className="text-white">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Durum:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                  order.status === 'paid' ? 'bg-yellow-500/20 text-yellow-400' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {order.status}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Takip No:</span>
                  <span className="text-white font-mono">{order.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-primary/20 pt-3">
                <span className="text-gray-400">Toplam Tutar:</span>
                <span className="text-white font-semibold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
