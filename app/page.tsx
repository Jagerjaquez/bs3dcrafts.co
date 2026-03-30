import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ArrowRight, Layers, Zap, Shield, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
            {/* Placeholder for background image - replace with your image */}
            <div className="w-full h-full bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
            {/* Alternative: If you want to use Next.js Image component */}
            {/* <Image 
              src="/hero-bg.jpg" 
              alt="3D Printing Background" 
              fill 
              className="object-cover opacity-30"
              priority
            /> */}
          </div>

          {/* Blurred Product Images Background */}
          <div className="absolute inset-0 z-[5] pointer-events-none">
            <div className="absolute top-1/4 left-[10%] w-80 h-80 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-primary/50">
              <Image src="/product1.jpg" alt="Product 1" fill className="object-cover" />
            </div>
            <div className="absolute top-1/3 right-[15%] w-72 h-72 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-secondary/50" style={{ animationDelay: '1s' }}>
              <Image src="/product2.jpg" alt="Product 2" fill className="object-cover" />
            </div>
            <div className="absolute bottom-1/4 left-[20%] w-64 h-64 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-accent/50" style={{ animationDelay: '2s' }}>
              <Image src="/product3.jpg" alt="Product 3" fill className="object-cover" />
            </div>
            <div className="absolute bottom-1/3 right-[10%] w-72 h-72 rounded-full overflow-hidden opacity-40 blur-sm animate-float border-4 border-primary/50" style={{ animationDelay: '3s' }}>
              <Image src="/product4.jpg" alt="Product 4" fill className="object-cover" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 animate-glow">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">Premium 3D Printing</span>
              </div>

              {/* Main heading with gradient */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                Her Katmanda <span className="gradient-text text-hover-gradient">Mükemmellik</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                3D baskı teknolojisi ile üretilen premium kalite ürünler. 
                Her detayda mükemmellik.
              </p>
              
              <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/products">
                  <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all hover-glow shadow-2xl shadow-primary/60 group relative overflow-hidden animate-pulse-glow">
                    {/* Animated background */}
                    <span className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <span className="relative flex items-center gap-3">
                      <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform animate-pulse" />
                      <span className="font-bold tracking-wide">Ürünleri Keşfet</span>
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform animate-bounce" />
                    </span>
                    
                    {/* Shine effect */}
                    <span className="absolute inset-0 shimmer" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] z-0" />
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 group-hover:scale-110 transition-transform">
                    <Layers className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-hover-glow">Yüksek Kalite</h3>
                  <p className="text-gray-300 leading-relaxed">
                    En son teknoloji 3D yazıcılar ile mikron hassasiyetinde üretim
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <div className="group relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-hover-glow">Hızlı Teslimat</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Optimize edilmiş üretim süreci ile kısa teslimat süreleri
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <div className="group relative animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                <div className="glass rounded-2xl p-8 hover-glow transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-hover-glow">Güvenli Alışveriş</h3>
                  <p className="text-gray-300 leading-relaxed">
                    <span className="text-white text-2xl">🔒</span> SSL sertifikalı güvenli ödeme altyapısı ile korumalı işlemler
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-scale-in">
              <div className="glass rounded-3xl p-12 neon-border relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 text-white">
                  Hayalinizdeki Ürünü <span className="gradient-text text-hover-gradient">Gerçeğe</span> Dönüştürün
                </h2>
                <p className="text-xl text-gray-300 mb-8 relative z-10">
                  3D baskı teknolojisinin sınırsız olanaklarını keşfedin
                </p>
                <Link href="/products">
                  <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow relative z-10">
                    Ürünlere Göz At
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
