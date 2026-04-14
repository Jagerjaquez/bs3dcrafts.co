import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ArrowRight, Layers, Zap, Shield, Sparkles, Camera, Upload, Star, TrendingUp, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { HomepageContent } from '@/components/homepage-content'
import { HomepageFallback } from '@/components/homepage-fallback'
import { Suspense } from 'react'
import { ContentSkeleton } from '@/components/content-skeleton'

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
        <Suspense fallback={<ContentSkeleton />}>
          <HomepageContent />
        </Suspense>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  )
}
