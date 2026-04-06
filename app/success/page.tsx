'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart'
import { CheckCircle, Loader2 } from 'lucide-react'
import { TestModeBanner } from '@/components/test-mode-banner'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  customerName: string
  email: string
  totalAmount: number
  status: string
  items: OrderItem[]
  createdAt: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id') // PayTR order ID
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Clear cart after successful payment
    clearCart()

    // Fetch order details if session_id (Stripe) or order_id (PayTR) is present
    const orderIdentifier = sessionId || orderId
    if (orderIdentifier) {
      setLoading(true)
      
      // Use different endpoint based on payment method
      const endpoint = sessionId 
        ? `/api/orders/${sessionId}` // Stripe session ID
        : `/api/orders/paytr/${orderId}` // PayTR order ID
      
      console.log('Fetching order from:', endpoint)
        
      fetch(endpoint)
        .then((res) => {
          console.log('Order API response status:', res.status)
          if (!res.ok) {
            throw new Error(`Order API returned ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => {
          console.log('Order data received:', data)
          setOrder(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching order:', err)
          setError(err.message)
          setLoading(false)
        })
    } else {
      console.log('No order identifier found in URL params')
    }
  }, [sessionId, orderId, clearCart])

  return (
    <div className="min-h-screen flex flex-col">
      <TestModeBanner />
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6 animate-pulse-glow" />
            <h1 className="text-4xl font-bold mb-4 text-white">Siparişiniz Alındı!</h1>
            <p className="text-xl text-gray-300 mb-4">
              Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacak.
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && !error && order && (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Sipariş Detayları</h2>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="font-semibold">Sipariş No:</span>{' '}
                    <span className="font-mono text-primary">{order.id}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Müşteri:</span> {order.customerName}
                  </p>
                  <p>
                    <span className="font-semibold">E-posta:</span> {order.email}
                  </p>
                  <p>
                    <span className="font-semibold">Durum:</span>{' '}
                    <span className="capitalize">{order.status}</span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Ürünler</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-gray-900/50 rounded-lg p-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.product.name}</p>
                        <p className="text-gray-400 text-sm">
                          {item.quantity} x ₺{item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-white font-semibold">
                        ₺{(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-white">Toplam:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₺{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!loading && !sessionId && !orderId && (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700 text-center">
              <p className="text-gray-300">
                Sipariş detayları yüklenemedi, ancak ödemeniz başarıyla alındı.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-800/50 rounded-lg p-6 mb-8 border border-red-700 text-center">
              <p className="text-red-300 mb-2">
                Sipariş detayları yüklenemedi: {error}
              </p>
              <p className="text-gray-300 text-sm">
                Ancak ödemeniz başarıyla alındı.
              </p>
              {(sessionId || orderId) && (
                <p className="text-gray-400 text-xs mt-2">
                  Order ID: {sessionId || orderId}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                Alışverişe Devam Et
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-primary/30 text-white hover:bg-primary/10">
                Ana Sayfa
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <TestModeBanner />
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6 animate-pulse-glow" />
            <h1 className="text-4xl font-bold mb-4 text-white">Siparişiniz Alındı!</h1>
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
