'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react'

export function CartItems() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()

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
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 glass border border-primary/20 rounded-lg">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-2 truncate text-white">{item.name}</h3>
              <p className="text-xl font-bold text-white">{formatPrice(item.price)}</p>
            </div>

            <div className="flex flex-col items-end justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="border-primary/30 text-white"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-white">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="border-primary/30 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="glass border border-primary/20 rounded-lg p-6 sticky top-4">
          <h2 className="text-2xl font-bold mb-6 text-white">Sipariş Özeti</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-300">Ara Toplam</span>
              <span className="font-semibold text-white">{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Kargo</span>
              <span className="font-semibold text-white">Ücretsiz</span>
            </div>
            <div className="border-t border-primary/20 pt-4">
              <div className="flex justify-between text-xl">
                <span className="font-bold text-white">Toplam</span>
                <span className="font-bold text-white">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
          </div>

          <Link href="/checkout">
            <Button size="lg" className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow shadow-lg shadow-primary/50 group">
              <CreditCard className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Ödemeye Geç
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
