'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, ArrowRight, Tag, Truck, Gift, Package, Shield } from 'lucide-react'
import { useState } from 'react'

export function CartItems() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [giftWrap, setGiftWrap] = useState(false)
  const [orderNote, setOrderNote] = useState('')

  const FREE_SHIPPING_THRESHOLD = 500
  const GIFT_WRAP_PRICE = 25

  const subtotal = getTotalPrice()
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0
  const giftWrapCost = giftWrap ? GIFT_WRAP_PRICE : 0
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 50
  const total = subtotal - discount + giftWrapCost + shippingCost

  const progressToFreeShipping = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)

  // Mock coupon codes
  const validCoupons = {
    'ILKSIPARISIM': 10,
    'YENI2024': 15,
    'INDIRIM20': 20,
    'VIP30': 30
  }

  const applyCoupon = () => {
    const upperCode = couponCode.toUpperCase()
    if (validCoupons[upperCode as keyof typeof validCoupons]) {
      setAppliedCoupon({
        code: upperCode,
        discount: validCoupons[upperCode as keyof typeof validCoupons]
      })
      setCouponError('')
    } else {
      setCouponError('Geçersiz kupon kodu')
      setAppliedCoupon(null)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <ShoppingBag className="h-24 w-24 mx-auto text-primary/50 mb-6" />
        <h2 className="text-2xl font-semibold mb-4 text-white">Sepetiniz boş</h2>
        <p className="text-gray-300 mb-8">Ürün eklemek için alışverişe başlayın</p>
        <Link href="/products">
          <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">Ürünleri Keşfet</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Free Shipping Progress */}
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="glass rounded-2xl p-6 border border-primary/20 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-6 w-6 text-primary animate-bounce-slow" />
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {remainingForFreeShipping > 0
                    ? `Ücretsiz kargo için ${formatPrice(remainingForFreeShipping)} daha ekleyin!`
                    : 'Ücretsiz kargo kazandınız! 🎉'}
                </p>
              </div>
            </div>
            <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 p-6 glass border border-primary/20 rounded-2xl hover-glow transition-all animate-slide-in-left"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-primary/5 flex-shrink-0 group">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl mb-2 text-white hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-2xl font-bold gradient-text">{formatPrice(item.price)}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Toplam: {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 glass rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="text-white hover:bg-primary/20"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-white text-lg">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-white hover:bg-primary/20"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Note */}
        <div className="glass rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-white">Sipariş Notu (Opsiyonel)</h3>
          </div>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Siparişiniz hakkında özel bir notunuz var mı?"
            className="w-full px-4 py-3 rounded-xl glass border border-primary/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="glass border border-primary/20 rounded-2xl p-6 sticky top-24 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Sipariş Özeti
          </h2>

          {/* Coupon Code */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Kupon Kodu
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    {appliedCoupon.code} (%{appliedCoupon.discount})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value)
                      setCouponError('')
                    }}
                    placeholder="Kupon kodunu girin"
                    className="flex-1 px-4 py-2 rounded-xl glass border border-primary/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={!couponCode}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Uygula
                  </Button>
                </div>
                {couponError && (
                  <p className="text-sm text-destructive">{couponError}</p>
                )}
                <p className="text-xs text-gray-400">
                  Geçerli kuponlar: ILKSIPARISIM, YENI2024, INDIRIM20
                </p>
              </div>
            )}
          </div>

          {/* Gift Wrap */}
          <div className="flex items-center justify-between p-4 glass rounded-xl border border-primary/20">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-white">Hediye Paketi</p>
                <p className="text-sm text-gray-400">{formatPrice(GIFT_WRAP_PRICE)}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary"></div>
            </label>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 pt-4 border-t border-primary/20">
            <div className="flex justify-between text-gray-300">
              <span>Ara Toplam</span>
              <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-green-400">
                <span>İndirim (%{appliedCoupon.discount})</span>
                <span className="font-semibold">-{formatPrice(discount)}</span>
              </div>
            )}

            {giftWrap && (
              <div className="flex justify-between text-gray-300">
                <span>Hediye Paketi</span>
                <span className="font-semibold text-white">{formatPrice(giftWrapCost)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-300">
              <span>Kargo</span>
              <span className="font-semibold text-white">
                {shippingCost === 0 ? (
                  <span className="text-green-400">Ücretsiz</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>

            <div className="border-t border-primary/20 pt-4">
              <div className="flex justify-between text-2xl">
                <span className="font-bold text-white">Toplam</span>
                <span className="font-bold gradient-text">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <Link href="/checkout">
            <Button
              size="lg"
              className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow shadow-2xl shadow-primary/50 group animate-pulse-glow"
            >
              <CreditCard className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
              Ödemeye Geç
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Shield className="h-4 w-4" />
            <span>Güvenli ödeme</span>
          </div>
        </div>
      </div>
    </div>
  )
}
