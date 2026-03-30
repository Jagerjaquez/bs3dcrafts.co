import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Rocket, Calendar, TrendingUp, Award } from 'lucide-react'

export default function KurulusPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <Rocket className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold text-white">Kuruluş Hikayemiz</h1>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary rounded-full mb-8" />
          </div>

          <div className="space-y-8">
            <section className="glass rounded-lg p-8 hover-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start gap-4 mb-6">
                <Calendar className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">Başlangıç</h2>
                  <p className="text-xl text-gray-300 leading-relaxed mb-4">
                    BS3DCRAFTS.CO, 3D baskı teknolojisine olan tutkuyla 2024 yılında kuruldu.
                  </p>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Kurucularımız, bu teknolojinin potansiyelini fark ederek, Türkiye'de kaliteli 
                    ve erişilebilir 3D baskı ürünleri sunma hedefiyle yola çıktı. İlk günden itibaren 
                    kalite ve müşteri memnuniyetini ön planda tutarak büyümeye devam ettik.
                  </p>
                </div>
              </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold mb-6 text-white">Gelişim Sürecimiz</h2>
              <div className="space-y-4">
                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 rounded-full p-3">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">İlk Adım - 2024 Q1</h3>
                      <p className="text-gray-300">
                        İlk 3D yazıcımızı alarak küçük bir atölyede üretime başladık. 
                        İlk müşterilerimize özel tasarım ürünler sunduk.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-secondary">
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary/20 rounded-full p-3">
                      <span className="text-2xl font-bold text-secondary">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Büyüme - 2024 Q2</h3>
                      <p className="text-gray-300">
                        Artan talep üzerine ekipmanlarımızı genişlettik. Yeni yazıcılar ve 
                        profesyonel ekipman yatırımları yaptık.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-accent">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/20 rounded-full p-3">
                      <span className="text-2xl font-bold text-accent">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">E-Ticaret - 2024 Q3</h3>
                      <p className="text-gray-300">
                        Online satış platformumuzu hayata geçirdik. Türkiye'nin her yerine 
                        ürün göndermeye başladık.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-lg p-6 hover-glow border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 rounded-full p-3">
                      <span className="text-2xl font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">Bugün - 2026</h3>
                      <p className="text-gray-300">
                        Modern ekipmanlarımız ve deneyimli ekibimizle, müşterilerimize 
                        en yüksek kalitede ürünler sunmaya devam ediyoruz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                Başarılarımız
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-lg p-6 hover-glow text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-gray-300">Mutlu Müşteri</p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">1000+</div>
                  <p className="text-gray-300">Tamamlanan Proje</p>
                </div>

                <div className="glass rounded-lg p-6 hover-glow text-center">
                  <div className="text-4xl font-bold text-accent mb-2">%98</div>
                  <p className="text-gray-300">Müşteri Memnuniyeti</p>
                </div>
              </div>
            </section>

            <section className="glass rounded-lg p-8 bg-gradient-to-br from-primary/10 to-secondary/10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start gap-4">
                <Award className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">Geleceğe Doğru</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Her geçen gün büyüyen ailemize katılmaktan mutluluk duyarız. 
                    Önümüzdeki dönemde daha fazla yenilik, daha kaliteli ürünler ve 
                    daha geniş bir ürün yelpazesi ile sizlere hizmet vermeye devam edeceğiz. 
                    BS3DCRAFTS.CO ailesi olarak, 3D baskı dünyasında iz bırakmaya kararlıyız.
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
