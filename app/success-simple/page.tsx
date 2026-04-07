import { Suspense } from 'react'
import { CheckCircle } from 'lucide-react'

function SimpleSuccessContent() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Siparişiniz Alındı!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacak.
        </p>
        <div className="space-y-4">
          <a 
            href="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
          >
            Alışverişe Devam Et
          </a>
          <br />
          <a 
            href="/" 
            className="inline-block border border-gray-600 hover:bg-gray-800 px-6 py-3 rounded-lg text-white font-medium"
          >
            Ana Sayfa
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SimpleSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    }>
      <SimpleSuccessContent />
    </Suspense>
  )
}