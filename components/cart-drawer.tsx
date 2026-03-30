'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { formatPrice } from '@/lib/utils'
import { X, Minus, Plus, Trash2, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-[#0a0a0f] border-l border-primary/20 shadow-2xl z-[101] transform transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary/20 bg-black/30">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Sepetim</h2>
              {items.length > 0 && (
                <span className="bg-primary text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                  {items.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="h-24 w-24 text-primary/30 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Sepetiniz Boş</h3>
              <p className="text-gray-400 mb-6">Ürün eklemek için alışverişe başlayın</p>
              <Link href="/products" onClick={onClose}>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Ürünleri Keşfet
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-black/30 rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 truncate">{item.name}</h3>
                      <p className="text-lg font-bold text-primary mb-2">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 hover:bg-primary/10 rounded transition-colors disabled:opacity-50 border border-primary/30"
                        >
                          <Minus className="h-4 w-4 text-white" />
                        </button>
                        <span className="w-8 text-center font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors border border-primary/30"
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors self-start"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-primary/20 p-6 space-y-4 bg-black/30">
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg text-gray-300">Toplam</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Link href="/checkout" onClick={onClose}>
                    <Button
                      size="lg"
                      className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow shadow-lg shadow-primary/50 group"
                    >
                      <CreditCard className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Ödemeye Geç
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    onClick={onClose}
                    className="w-full text-lg py-6 bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-all hover-glow shadow-lg shadow-secondary/50 group"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Alışverişe Devam Et
                  </Button>

                  <Link href="/cart" onClick={onClose}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-primary/30 text-white hover:bg-primary/10"
                    >
                      Sepeti Görüntüle
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  🔒 Güvenli ödeme altyapısı ile korumalı alışveriş
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
