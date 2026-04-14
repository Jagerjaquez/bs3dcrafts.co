'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'

export function SuccessCartClearer() {
  const clearCart = useCartStore((state) => state.clearCart)
  const isHydrated = useCartStore((state) => state.isHydrated)

  useEffect(() => {
    if (isHydrated) {
      // Clear cart after successful payment
      clearCart()
    }
  }, [clearCart, isHydrated])

  // This component doesn't render anything
  return null
}