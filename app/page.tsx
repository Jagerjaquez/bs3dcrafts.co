import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ArrowRight, Layers, Zap, Shield, Sparkles, Camera, Upload, Star, TrendingUp, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-bounce-slow" />
      </div>

      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
            <div className="w-full h-full bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
          </div>

          {/* Blurred Product Images Background */}
          <div className="absolute inset-0 z-[5] pointer-events-none">
            <div className="absolute top-1/4 left-[10%] w-80 h-80 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-primary/50 animate-rotate-slow">
              <Image src="/product1.jpg" alt="Product 1" fill className="object-cover" />
            </div>
            <div className="absolute top-1/3 right-[15%] w-72 h-72 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-secondary/50" style={{ animationDelay: '1s' }}>
              <Image src="/product2.jpg" alt="Product 2" fill className="object-cover animate-zoom-in" />
            </div>
            <div className="absolute bottom-1/4 left-[20%] w-64 h-64 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-accent/50 animate-wiggle" style={{ animationDelay: '2s' }}>
              <Image src="/product3.jpg" alt="Product 3" fill className="object-cover" />
            </div>
            <div className="absolute bottom-1/3 right-[10%] w-72 h-72 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-primary/50" style={{ animationDelay: '3s' }}>
              <Image src="/product4.jpg" alt="Product 4" fill className="object-cover" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 animate-glow animate-bounce-slow">
                <Sparkles className="h-4 w-4 text-primary animate-wiggle" />
                <span className="text-sm font-medium text-white">Premium 3D Printing</span>
              </div>

              {/* Main heading with gradient */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white animate-zoom-in">
                Her Katmanda <span className="gradient-text text-hover-gradient animate-gradient-shift">Mükemmellik</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                3D baskı teknolojisi ile üretilen premium kalite ürünler. 
                Her detayda mükemmellik.
              </p>
              
              <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/products">
                  <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all hover-glow shadow-2xl shadow-primary/60 group relative overflow-hidden animate-pulse-glow">
                    <span className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-shift" />
                    
                    <span className="relative flex items-center gap-3">
                      <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform animate-pulse" />
                      <span className="font-bold tracking-wide">Ürünleri Keşfet</span>
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform animate-bounce" />
                    </span>
                    
                    <span className="absolute inset-0 shimmer" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] z-0" />
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative animate-flip-in" style={{ animationDelay: '0.1s' }}>
                <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 group-hover:scale-110 transition-transform animate-bounce-slow">
                    <Layers className="h-8 w-8 text-primary animate-wiggle" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-hover-glow">Yüksek Kalite</h3>
                  <p className="text-gray-300 leading-relaxed">
                    En son teknoloji 3D yazıcılar ile mikron hassasiyetinde üretim
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <div className="group relative animate-zoom-in" style={{ animationDelay: '0.2s' }}>
                <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 mb-6 group-hover:scale-110 transition-transform animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                    <Zap className="h-8 w-8 text-secondary animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-hover-glow">Hızlı Teslimat</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Optimize edilmiş üretim süreci ile kısa teslimat süreleri
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <div className="group relative animate-flip-in" style={{ animationDelay: '0.3s' }}>
                <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 mb-6 group-hover:scale-110 transition-transform animate-bounce-slow" style={{ animationDelay: '1s' }}>
                    <Shield className="h-8 w-8 text-accent animate-wiggle" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-hover-glow">Güvenli Alışveriş</h3>
                  <p className="text-gray-300 leading-relaxed">
                    SSL sertifikalı güvenli ödeme altyapısı ile korumalı işlemler
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Products Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/20 mb-6 animate-bounce-slow">
                <TrendingUp className="h-4 w-4 text-secondary animate-pulse" />
                <span className="text-sm font-medium text-white">En Çok Satanlar</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white animate-zoom-in">
                Popüler <span className="gradient-text">Ürünler</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Müşterilerimizin en çok tercih ettiği 3D baskı ürünleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative animate-slide-in-bottom" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="glass rounded-2xl overflow-hidden hover-glow transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <Image 
                        src={`/product${i}.${i === 1 || i === 4 ? 'png' : 'jpg'}`} 
                        alt={`Popüler Ürün ${i}`} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full animate-pulse-glow">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-white fill-white animate-wiggle" />
                          <span className="text-sm font-bold text-white">Popüler</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors">
                        3D Baskı Ürün {i}
                      </h3>
                      <p className="text-gray-400 mb-4">Premium kalite 3D baskı</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold gradient-text">₺{(i * 150 + 99).toFixed(2)}</span>
                        <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 animate-pulse-glow">
                          İncele
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 animate-fade-in-up">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 hover-glow animate-bounce-slow">
                  Tüm Ürünleri Gör
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Custom Figure Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="glass rounded-3xl overflow-hidden neon-border animate-zoom-in">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left side - Image */}
                  <div className="relative h-96 md:h-auto overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-gradient-shift" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-6 p-8 animate-float">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm animate-pulse-glow">
                          <Camera className="h-16 w-16 text-white animate-wiggle" />
                        </div>
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-white mx-auto animate-bounce-slow" />
                          <p className="text-white font-bold text-xl">Fotoğrafını Yükle</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="p-8 md:p-12 flex flex-col justify-center animate-slide-in-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/20 mb-6 w-fit animate-bounce-slow">
                      <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                      <span className="text-sm font-medium text-white">Özel Tasarım</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white animate-fade-in-up">
                      Fotoğrafını Gönder, <span className="gradient-text animate-gradient-shift">Figürünü Yap</span>
                    </h2>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Sevdiklerinizin fotoğraflarından özel 3D figürler üretiyoruz. 
                      Doğum günü, yıldönümü veya özel günler için mükemmel bir hediye!
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        'Yüksek detay ve kalite',
                        'Kişiselleştirilebilir boyutlar',
                        '7-10 iş günü teslimat',
                        'Özel ambalaj seçenekleri'
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300 animate-slide-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-glow">
                            <span className="text-white text-sm">✓</span>
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/products" className="flex-1">
                        <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover-glow animate-pulse-glow">
                          <Camera className="mr-2 h-5 w-5 animate-wiggle" />
                          Hemen Başla
                        </Button>
                      </Link>
                      <Link href="/contact" className="flex-1">
                        <Button size="lg" variant="outline" className="w-full border-primary/50 hover:bg-primary/10 animate-bounce-slow">
                          Bilgi Al
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/20 mb-6 animate-bounce-slow">
                <Quote className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm font-medium text-white">Müşteri Yorumları</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white animate-zoom-in">
                Müşterilerimiz <span className="gradient-text">Ne Diyor?</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Binlerce mutlu müşterimizden bazı yorumlar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Ahmet Yılmaz',
                  role: 'Mimar',
                  comment: 'Proje maketlerim için kullandığım 3D baskı hizmeti mükemmel. Detaylar harika, teslimat hızlı. Kesinlikle tavsiye ederim!',
                  rating: 5,
                  image: '👨‍💼'
                },
                {
                  name: 'Zeynep Kaya',
                  role: 'Tasarımcı',
                  comment: 'Özel tasarım figürler için BS3DCrafts\'ı tercih ediyorum. Kalite ve müşteri hizmetleri harika. Teşekkürler!',
                  rating: 5,
                  image: '👩‍🎨'
                },
                {
                  name: 'Mehmet Demir',
                  role: 'Mühendis',
                  comment: 'Prototip üretimi için ideal. Hızlı, kaliteli ve uygun fiyatlı. Ekip çok profesyonel ve yardımsever.',
                  rating: 5,
                  image: '👨‍🔧'
                }
              ].map((testimonial, i) => (
                <div key={i} className="animate-slide-in-bottom" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full group relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-9xl text-primary/5 font-bold">
                      "
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-5xl">{testimonial.image}</div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                          <p className="text-gray-400 text-sm">{testimonial.role}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>

                      <p className="text-gray-300 leading-relaxed italic">
                        "{testimonial.comment}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Rakamlarla <span className="gradient-text">BS3DCrafts</span>
              </h2>
              <p className="text-xl text-gray-300">Güvenilir ve kaliteli hizmet</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '1000+', label: 'Mutlu Müşteri', icon: '😊' },
                { number: '5000+', label: 'Teslim Edilen Ürün', icon: '📦' },
                { number: '99%', label: 'Müşteri Memnuniyeti', icon: '⭐' },
                { number: '24/7', label: 'Destek Hizmeti', icon: '💬' }
              ].map((stat, i) => (
                <div key={i} className="text-center animate-zoom-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 group">
                    <div className="text-5xl mb-4 animate-bounce-slow">{stat.icon}</div>
                    <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">
                      {stat.number}
                    </div>
                    <div className="text-gray-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 animate-gradient-shift" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="glass rounded-3xl p-12 neon-border text-center animate-zoom-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6 animate-bounce-slow">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-white">Özel Fırsatlar</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Kampanyalardan <span className="gradient-text">Haberdar Olun</span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar olun
                </p>

                <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="flex-1 px-6 py-4 rounded-xl glass border border-primary/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold rounded-xl transition-all hover-glow animate-pulse-glow whitespace-nowrap"
                  >
                    Abone Ol
                  </button>
                </form>

                <p className="text-sm text-gray-400 mt-4">
                  Dilediğiniz zaman abonelikten çıkabilirsiniz. Gizliliğinize saygı duyuyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-zoom-in">
              <div className="glass rounded-3xl p-12 neon-border relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 text-white animate-fade-in-up">
                  Hayalinizdeki Ürünü <span className="gradient-text text-hover-gradient animate-gradient-shift">Gerçeğe</span> Dönüştürün
                </h2>
                <p className="text-xl text-gray-300 mb-8 relative z-10 animate-slide-up">
                  3D baskı teknolojisinin sınırsız olanaklarını keşfedin
                </p>
                <Link href="/products">
                  <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow relative z-10 animate-pulse-glow">
                    Ürünlere Göz At
                    <ArrowRight className="ml-2 h-5 w-5 animate-bounce" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  )
}
