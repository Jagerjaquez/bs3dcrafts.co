import Link from 'next/link'
import { Instagram, Twitter, Mail, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative glass border-t border-primary/10 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              <span className="text-white gradient-text">BS3DCRAFTS</span>
              <span className="text-primary">.CO</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Precision in Every Layer. Profesyonel 3D baskı çözümleri.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Kurumsal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Hakkımızda</span>
                </Link>
              </li>
              <li>
                <Link href="/production" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Üretim Süreci</span>
                </Link>
              </li>
              <li>
                <Link href="/quality" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Kalite Kontrol</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Destek</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">SSS</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">İletişim</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Gizlilik Politikası</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Mesafeli Satış Sözleşmesi</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">İletişim</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-primary transition-colors">bs3dcrafts.co@outlook.com</li>
              <li className="flex gap-4 pt-2">
                <a 
                  href="https://www.instagram.com/bs3dcrafts.co/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com/bs3dcrafts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="mailto:bs3dcrafts.co@outlook.com" 
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            &copy; {new Date().getFullYear()} BS3DCRAFTS.CO. Tüm hakları saklıdır. 
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-destructive animate-pulse-glow" /> in Turkey
            </span>
          </p>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </footer>
  )
}
