'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { formatPrice } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ERROR_MESSAGES } from '@/lib/error-handler'

export function CheckoutForm() {
  const router = useRouter()
  const { items, getTotalPrice } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paytr'>('stripe')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    setIsTestMode(publishableKey.startsWith('pk_test_'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (items.length === 0) {
      setError(ERROR_MESSAGES.EMPTY_CART)
      return
    }

    const total = getTotalPrice()
    if (total <= 0) {
      setError('Sepet toplamı sıfır olamaz.')
      return
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError(ERROR_MESSAGES.INVALID_FORM)
      return
    }

    setIsLoading(true)

    try {
      const endpoint = '/api/checkout/session'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          customerInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || ERROR_MESSAGES.GENERIC_ERROR)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(ERROR_MESSAGES.GENERIC_ERROR)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError(ERROR_MESSAGES.NETWORK_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="glass border border-primary/20 rounded-lg p-6 text-center">
        <p className="text-white text-lg">{ERROR_MESSAGES.EMPTY_CART}</p>
        <Button 
          onClick={() => router.push('/products')} 
          className="mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          Ürünlere Dön
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="glass border border-red-500/50 rounded-lg p-4 bg-red-500/10">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      <div className="glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Ödeme Yöntemi</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('paytr')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'paytr'
                ? 'border-primary bg-primary/20'
                : 'border-primary/30 bg-black/30 hover:border-primary/50'
            }`}
          >
            <div className="text-white font-semibold">PayTR</div>
            <div className="text-sm text-gray-400 mt-1">Türk Lirası</div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('stripe')}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'stripe'
                ? 'border-primary bg-primary/20'
                : 'border-primary/30 bg-black/30 hover:border-primary/50'
            }`}
          >
            <div className="text-white font-semibold">Stripe</div>
            <div className="text-sm text-gray-400 mt-1">Uluslararası</div>
          </button>
        </div>
      </div>

      <div className="glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">İletişim Bilgileri</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">Ad Soyad</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">E-posta</label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2 text-white">Telefon</label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2 text-white">Adres</label>
            <textarea
              id="address"
              required
              rows={4}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Sipariş Özeti</h2>
        
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-gray-300">
                {item.name} x {item.quantity}
              </span>
              <span className="font-semibold text-white">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          
          <div className="border-t border-primary/20 pt-4">
            <div className="flex justify-between text-xl">
              <span className="font-bold text-white">Toplam</span>
              <span className="font-bold text-white">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              İşleniyor...
            </>
          ) : (
            'Ödemeye Geç'
          )}
        </Button>

        {isTestMode && paymentMethod === 'stripe' && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm font-semibold mb-2">Test Modu - Test Kartları:</p>
            <ul className="text-yellow-300 text-xs space-y-1">
              <li>• Başarılı: 4242 4242 4242 4242</li>
              <li>• Reddedildi: 4000 0000 0000 0002</li>
              <li>• Doğrulama Gerekli: 4000 0025 0000 3155</li>
            </ul>
            <p className="text-yellow-300 text-xs mt-2">
              Herhangi bir gelecek tarih, 3 haneli CVC ve posta kodu kullanabilirsiniz.
            </p>
          </div>
        )}

        {paymentMethod === 'paytr' && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              PayTR ile güvenli ödeme yapabilirsiniz. Tüm Türk bankaları desteklenmektedir.
            </p>
          </div>
        )}
      </div>
    </form>
  )
}
