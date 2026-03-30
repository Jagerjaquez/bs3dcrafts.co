import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Target, Sparkles } from 'lucide-react'

export default function VizyonPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <Target className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold text-white">Vizyonumuz</h1>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary rounded-full mb-8" />
          </div>

          <div className="space-y-8">
            <section className="glass rounded-lg p-8 hover-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                3D baskı teknolojisini herkes için erişilebilir kılmak ve bu alanda 
                Türkiye'nin önde gelen markası olmak. Her üretimde mükemmelliği hedefliyor, 
                müşterilerimize en yüksek kalitede ürünler sunuyoruz.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Teknolojinin gücünü sanatla birleştirerek, hayal gücünün sınırlarını zorlayan 
                ürünler yaratmak ve 3D baskı sektöründe yenilikçi çözümler sunmak temel vizyonumuzdur.
              </p>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                Hedeflerimiz
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-primary">
                  <h3 className="text-xl font-semibold mb-3 text-white">Kalite Liderliği</h3>
                  <p className="text-gray-300">
                    Türkiye'de 3D baskı kalitesinde standartları belirleyen marka olmak
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-secondary">
                  <h3 className="text-xl font-semibold mb-3 text-white">Teknoloji Öncülüğü</h3>
                  <p className="text-gray-300">
                    En yeni 3D baskı teknolojilerini ilk benimseyen ve uygulayan firma olmak
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-accent">
                  <h3 className="text-xl font-semibold mb-3 text-white">Müşteri Memnuniyeti</h3>
                  <p className="text-gray-300">
                    Her müşteriye özel çözümler sunarak %100 memnuniyet sağlamak
                  </p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-primary">
                  <h3 className="text-xl font-semibold mb-3 text-white">Sürdürülebilirlik</h3>
                  <p className="text-gray-300">
                    Çevre dostu üretim yöntemleriyle sektörde örnek olmak
                  </p>
                </div>
              </div>
            </section>

            <section className="glass rounded-lg p-8 bg-gradient-to-br from-primary/10 to-secondary/10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold mb-4 text-white">Geleceğe Bakış</h2>
              <p className="text-gray-300 leading-relaxed">
                Önümüzdeki yıllarda 3D baskı teknolojisinin daha da yaygınlaşacağına ve 
                üretim süreçlerinde devrim yaratacağına inanıyoruz. BS3DCRAFTS.CO olarak, 
                bu dönüşümün öncüsü olmayı ve müşterilerimize en iyi deneyimi sunmayı hedefliyoruz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
