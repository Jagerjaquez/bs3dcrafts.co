import Link from 'next/link'
import { Instagram, Twitter, Mail, Heart } from 'lucide-react'
import { CmsFooterNav } from '@/components/cms-footer-nav'
import { DynamicFooterContent } from '@/components/dynamic-footer-content'

export function Footer() {
  return (
    <footer className="relative glass border-t border-primary/10 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12">
        <DynamicFooterContent />
      </div>

      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </footer>
  )
}
