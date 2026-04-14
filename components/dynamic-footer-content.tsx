'use client'

import Link from 'next/link'
import { Instagram, Twitter, Mail, Heart, Facebook, Linkedin } from 'lucide-react'
import { CmsFooterNav } from '@/components/cms-footer-nav'
import { useSiteSettings } from '@/components/site-settings-provider'

export function DynamicFooterContent() {
  const { settings } = useSiteSettings()

  // Get values from settings with fallbacks
  const siteTitle = settings?.general?.siteTitle || 'BS3DCRAFTS'
  const tagline = settings?.general?.tagline || 'Precision in Every Layer. Profesyonel 3D baskı çözümleri.'
  const contactEmail = settings?.contact?.email || 'bs3dcrafts.co@outlook.com'
  const contactPhone = settings?.contact?.phone
  const contactAddress = settings?.contact?.address
  const instagramUrl = settings?.social?.instagram || 'https://www.instagram.com/bs3dcrafts.co/'
  const twitterUrl = settings?.social?.twitter || 'https://twitter.com/bs3dcrafts'
  const facebookUrl = settings?.social?.facebook
  const linkedinUrl = settings?.social?.linkedin

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">
            <span className="text-white gradient-text">{siteTitle}</span>
            <span className="text-primary">.CO</span>
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {tagline}
          </p>
        </div>

        <CmsFooterNav />

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
            <li className="hover:text-primary transition-colors">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </li>
            {contactPhone && (
              <li className="hover:text-primary transition-colors">
                <a href={`tel:${contactPhone}`}>{contactPhone}</a>
              </li>
            )}
            {contactAddress && (
              <li className="text-gray-400">
                {contactAddress}
              </li>
            )}
            <li className="flex gap-4 pt-2">
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {twitterUrl && (
                <a 
                  href={twitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {facebookUrl && (
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {linkedinUrl && (
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-all hover:scale-110 hover-glow"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              <a 
                href={`mailto:${contactEmail}`} 
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
          &copy; {new Date().getFullYear()} {siteTitle}.CO. Tüm hakları saklıdır. 
          <span className="inline-flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-destructive animate-pulse-glow" /> in Turkey
          </span>
        </p>
      </div>
    </>
  )
}