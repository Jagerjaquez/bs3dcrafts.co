import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Layers, Zap, Shield, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 text-white animate-slide-up">Hakkımızda</h1>
          <p className="text-xl text-gray-300 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            BS3DCRAFTS.CO olarak, 3D baskı teknolojisinin sınırlarını zorlayarak 
            premium kalitede ürünler üretiyoruz.
          </p>

          <div className="space-y-12">

            <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-3xl font-bold mb-6 text-white">Neden Biz?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-lg p-6 hover-glow">
                  <Layers className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Yüksek Hassasiyet</h3>
                  <p className="text-gray-300">
                    Mikron seviyesinde hassasiyet ile üretim yapıyoruz
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow">
                  <Zap className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Hızlı Üretim</h3>
                  <p className="text-gray-300">
                    Optimize edilmiş süreçler ile kısa teslimat süreleri
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow">
                  <Shield className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Kalite Garantisi</h3>
                  <p className="text-gray-300">
                    Her ürün detaylı kalite kontrolünden geçer
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow">
                  <Award className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Premium Malzeme</h3>
                  <p className="text-gray-300">
                    Sadece en kaliteli filamentleri kullanıyoruz
                  </p>
                </div>
              </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-3xl font-bold mb-4 text-white">Üretim Sürecimiz</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-6 py-2 glass rounded-r-lg hover-glow">
                  <h3 className="font-semibold text-lg text-white">1. Tasarım Optimizasyonu</h3>
                  <p className="text-gray-300">
                    Her model 3D baskı için optimize edilir
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-6 py-2 glass rounded-r-lg hover-glow">
                  <h3 className="font-semibold text-lg text-white">2. Malzeme Seçimi</h3>
                  <p className="text-gray-300">
                    Ürüne en uygun filament türü belirlenir
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-6 py-2 glass rounded-r-lg hover-glow">
                  <h3 className="font-semibold text-lg text-white">3. Üretim</h3>
                  <p className="text-gray-300">
                    Son teknoloji yazıcılarla hassas üretim
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-6 py-2 glass rounded-r-lg hover-glow">
                  <h3 className="font-semibold text-lg text-white">4. Kalite Kontrol</h3>
                  <p className="text-gray-300">
                    Detaylı inceleme ve test süreçleri
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-6 py-2 glass rounded-r-lg hover-glow">
                  <h3 className="font-semibold text-lg text-white">5. Paketleme & Teslimat</h3>
                  <p className="text-gray-300">
                    Güvenli paketleme ve hızlı kargo
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
