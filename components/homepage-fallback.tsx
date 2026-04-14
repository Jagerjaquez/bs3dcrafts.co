'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Layers, Zap, Shield, Sparkles, Star } from 'lucide-react'

export function HomepageFallback() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 animate-glow animate-bounce-slow">
              <Sparkles className="h-4 w-4 text-primary animate-wiggle" />
              <span className="text-sm font-medium text-white">Premium 3D Printing</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white animate-zoom-in">
              <span className="gradient-text text-hover-gradient animate-gradient-shift">
                Her Katmanda Mükemmellik
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              3D baskı teknolojisi ile üretilen premium kalite ürünler. Her detayda mükemmellik.
            </p>
            
            <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/products">
                <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all hover-glow shadow-2xl shadow-primary/60 group relative overflow-hidden animate-pulse-glow">
                  <span className="relative flex items-center gap-3">
                    <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform animate-pulse" />
                    <span className="font-bold tracking-wide">Ürünleri Keşfet</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform animate-bounce" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white animate-zoom-in">
              Müşterilerimiz <span className="gradient-text">Ne Diyor?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Binlerce mutlu müşterimizden bazı yorumlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="animate-slide-in-bottom">
              <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">👨‍💼</div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Ahmet Yılmaz</h4>
                      <p className="text-gray-400 text-sm">Mimar</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={starIndex} className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: `${starIndex * 0.1}s` }} />
                    ))}
                  </div>

                  <p className="text-gray-300 leading-relaxed italic">
                    "Proje maketlerim için kullandığım 3D baskı hizmeti mükemmel. Detaylar harika, teslimat hızlı."
                  </p>
                </div>
              </div>
            </div>

            <div className="animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
              <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">👩‍🎨</div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Zeynep Kaya</h4>
                      <p className="text-gray-400 text-sm">Tasarımcı</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={starIndex} className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: `${starIndex * 0.1}s` }} />
                    ))}
                  </div>

                  <p className="text-gray-300 leading-relaxed italic">
                    "Özel tasarım figürler için BS3DCrafts'ı tercih ediyorum. Kalite ve müşteri hizmetleri harika."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-zoom-in">
            <div className="glass rounded-3xl p-12 neon-border relative overflow-hidden group">
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
    </>
  )
}