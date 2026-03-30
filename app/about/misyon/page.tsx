import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Compass, Heart, Users, Lightbulb } from 'lucide-react'

export default function MisyonPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <Compass className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold text-white">Misyonumuz</h1>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary rounded-full mb-8" />
          </div>

          <div className="space-y-8">
            <section className="glass rounded-lg p-8 hover-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Yenilikçi 3D baskı teknolojileri ile müşterilerimize en kaliteli ürünleri sunmak, 
                sürdürülebilir üretim yöntemleriyle çevreye duyarlı olmak ve sektörde öncü bir marka olmak.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Her projede müşteri memnuniyetini ön planda tutarak, yaratıcı çözümler üretmek 
                ve 3D baskı teknolojisinin potansiyelini en üst düzeyde kullanmak temel misyonumuzdur.
              </p>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold mb-6 text-white">Değerlerimiz</h2>
              <div className="space-y-6">
                <div className="glass rounded-lg p-6 hover-glow flex gap-4">
                  <Heart className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Müşteri Odaklılık</h3>
                    <p className="text-gray-300">
                      Her müşterimizin ihtiyaçlarını dinliyor, beklentilerini aşmak için çalışıyoruz. 
                      Müşteri memnuniyeti bizim için en önemli başarı kriteridir.
                    </p>
                  </div>
                </div>

                <div className="glass rounded-lg p-6 hover-glow flex gap-4">
                  <Lightbulb className="h-8 w-8 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">İnovasyon</h3>
                    <p className="text-gray-300">
                      Sürekli gelişim ve yenilik peşinde koşuyoruz. En son teknolojileri takip ediyor, 
                      üretim süreçlerimizi sürekli iyileştiriyoruz.
                    </p>
                  </div>
                </div>

                <div className="glass rounded-lg p-6 hover-glow flex gap-4">
                  <Users className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Ekip Çalışması</h3>
                    <p className="text-gray-300">
                      Güçlü ekibimizle birlikte çalışarak, her projede en iyi sonuçları elde ediyoruz. 
                      Deneyim ve bilgi paylaşımına önem veriyoruz.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-3xl font-bold mb-6 text-white">Sorumluluklarımız</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-lg p-6 hover-glow">
                  <h3 className="text-xl font-semibold mb-3 text-white">Kalite Garantisi</h3>
                  <p className="text-gray-300">
                    Her ürünümüz detaylı kalite kontrolünden geçer ve en yüksek standartları karşılar
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow">
                  <h3 className="text-xl font-semibold mb-3 text-white">Çevre Bilinci</h3>
                  <p className="text-gray-300">
                    Sürdürülebilir malzemeler kullanarak çevreye olan etkimizi minimize ediyoruz
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow">
                  <h3 className="text-xl font-semibold mb-3 text-white">Şeffaflık</h3>
                  <p className="text-gray-300">
                    Üretim süreçlerimizi ve malzemelerimizi müşterilerimizle açık bir şekilde paylaşıyoruz
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow">
                  <h3 className="text-xl font-semibold mb-3 text-white">Sürekli Gelişim</h3>
                  <p className="text-gray-300">
                    Kendimizi ve süreçlerimizi sürekli geliştirerek daha iyisini sunmaya çalışıyoruz
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
