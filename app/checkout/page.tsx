'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CheckoutForm } from '@/components/checkout-form'
import { TestModeBanner } from '@/components/test-mode-banner'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TestModeBanner />
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Ödeme</h1>
          <CheckoutForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
