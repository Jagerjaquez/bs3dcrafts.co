import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 text-white animate-slide-up">İletişim</h1>
          <p className="text-xl text-gray-300 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Sorularınız için bize ulaşın. Size yardımcı olmaktan mutluluk duyarız.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-lg p-6 text-center hover-glow animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">E-posta</h3>
              <a href="mailto:bs3dcrafts.co@outlook.com" className="text-gray-300 hover:text-primary transition-colors">
                bs3dcrafts.co@outlook.com
              </a>
            </div>

            <div className="glass rounded-lg p-6 text-center hover-glow animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">Telefon</h3>
              <a href="tel:+905464519597" className="text-gray-300 hover:text-primary transition-colors">
                +90 546 451 95 97
              </a>
            </div>

            <div className="glass rounded-lg p-6 text-center hover-glow animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">Adres</h3>
              <p className="text-gray-300">
                Karşıyaka, İzmir<br />
                Türkiye
              </p>
            </div>
          </div>

          <div className="glass rounded-lg p-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl font-bold mb-6 text-white">Bize Mesaj Gönderin</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Ad Soyad</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-background/50 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">E-posta</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-background/50 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Konu</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-background/50 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Mesajınızın konusu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Mesajınız</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-background/50 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all hover-glow"
              >
                Gönder
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
