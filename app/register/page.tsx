'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { UserPlus, Mail, Phone, Lock, User, ArrowRight, Sparkles, CheckCircle, Shield } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, register } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/account')
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setIsLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      })
      router.push('/account')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6 animate-bounce-slow">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-white">Yeni Üyelik</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4 animate-zoom-in">
              Hesap <span className="gradient-text">Oluştur</span>
            </h2>
            <p className="text-gray-300">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-secondary transition-colors">
                Giriş yapın
              </Link>
            </p>
          </div>

          {/* Form */}
          <div className="glass rounded-2xl p-8 neon-border animate-slide-up">
            {/* Benefits */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 glass rounded-lg border border-primary/20">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-300">Hızlı Sipariş</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg border border-primary/20">
                <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm text-gray-300">Sipariş Takibi</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg border border-primary/20">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm text-gray-300">Özel Kampanyalar</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 animate-shake">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Ad Soyad *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>

                {/* Email */}
                <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Adresi *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                {/* Phone */}
                <div className="animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+90 555 123 4567"
                  />
                </div>

                {/* Password */}
                <div className="animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Şifre *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="En az 8 karakter"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Şifreniz en az 8 karakter olmalıdır
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Şifre Tekrar *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Şifrenizi tekrar girin"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-600 rounded bg-transparent"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-300">
                  <Link href="/terms" className="text-primary hover:text-secondary transition-colors">
                    Kullanım Şartları
                  </Link>
                  {' '}ve{' '}
                  <Link href="/privacy" className="text-primary hover:text-secondary transition-colors">
                    Gizlilik Politikası
                  </Link>
                  'nı kabul ediyorum
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-glow animate-pulse-glow"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Hesap oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Hesap Oluştur</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back Link */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
              ← Ana sayfaya dön
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  )
}
