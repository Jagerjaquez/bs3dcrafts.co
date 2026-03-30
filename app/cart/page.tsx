'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartItems } from '@/components/cart-items'

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-white">Sepetim</h1>
          <CartItems />
        </div>
      </main>

      <Footer />
    </div>
  )
}
