import { Suspense } from 'react'
import { SuccessCartClearer } from '@/components/success-cart-clearer'

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderId = params.order_id as string
  const sessionId = params.session_id as string

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <SuccessCartClearer />
      
      <div className="bg-yellow-600 text-black text-center py-2 text-sm font-medium">
        TEST MODE - Gerçek ödemeler işlenmeyecek
      </div>
      
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-white">
              BS3DCRAFTS.CO
            </a>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-gray-300 hover:text-white">Ana Sayfa</a>
              <a href="/contact" className="text-gray-300 hover:text-white">İletişim</a>
              <a href="/login" className="text-gray-300 hover:text-white">Giriş</a>
              <a href="/register" className="text-gray-300 hover:text-white">Kayıt Ol</a>
              <a href="/cart" className="text-gray-300 hover:text-white">Sepetim</a>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="text-green-500 text-8xl mb-6">✓</div>
          <h1 className="text-4xl font-bold mb-4 text-white">Siparişiniz Alındı!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacak.
          </p>
          
          <div className="bg-blue-800/50 rounded-lg p-6 mb-8 border border-blue-700">
            <p className="text-blue-300 mb-2">
              🎉 PayTR ile ödemeniz başarıyla tamamlandı!
            </p>
            <p className="text-gray-300 text-sm">
              Sipariş detayları e-posta adresinize gönderilecektir.
            </p>
            {(orderId || sessionId) && (
              <p className="text-gray-400 text-xs mt-2">
                Sipariş Referansı: {orderId || sessionId}
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <a 
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 px-8 py-3 rounded-lg text-white font-medium text-lg"
            >
              Alışverişe Devam Et
            </a>
            <a 
              href="/"
              className="inline-block border border-gray-600 hover:bg-gray-800 px-8 py-3 rounded-lg text-white font-medium text-lg"
            >
              Ana Sayfa
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 BS3DCRAFTS.CO. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  )
}
