'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { LogIn, Mail, Lock, ArrowRight, Sparkles, User, Shield, Menu, X, CheckCircle } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  
  const { user, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'

  useEffect(() => {
    if (user) {
      router.push(redirect)
    }
  }, [user, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loginOptions = [
    {
      icon: User,
      title: 'Kullanıcı Girişi',
      description: 'Email ve şifrenizle giriş yapın',
      action: () => setShowMenu(false),
      color: 'from-primary to-secondary'
    },
    {
      icon: Shield,
      title: 'Admin Girişi',
      description: 'Yönetici paneline erişim',
      action: () => router.push('/admin/login'),
      color: 'from-secondary to-accent'
    }
  ]

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
              <span className="text-sm font-medium text-white">Hoş Geldiniz</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4 animate-zoom-in">
              Giriş <span className="gradient-text">Yap</span>
            </h2>
            <p className="text-gray-300">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-secondary transition-colors">
                Kayıt olun
              </Link>
            </p>
          </div>

          {/* Login Type Menu Button */}
          <div className="flex justify-center animate-slide-up">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-6 py-3 glass rounded-lg border border-primary/20 text-white hover:border-primary/40 transition-all hover-glow"
            >
              <Menu className="h-5 w-5" />
              <span>Giriş Türü Seç</span>
            </button>
          </div>

          {/* Hamburger Menu */}
          {showMenu && (
            <div className="glass rounded-2xl p-6 neon-border animate-zoom-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Giriş Türü Seçin</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {loginOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={option.action}
                    className={`w-full p-4 glass rounded-lg border border-primary/20 hover:border-primary/40 transition-all hover-glow text-left group animate-slide-in-left`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color} group-hover:scale-110 transition-transform`}>
                        <option.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-400">{option.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Login Form */}
          {!showMenu && (
            <div className="glass rounded-2xl p-8 neon-border animate-slide-up">
              {/* Benefits */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 glass rounded-lg border border-primary/20">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-gray-300">Güvenli Giriş</span>
                </div>
                <div className="flex items-center gap-3 p-3 glass rounded-lg border border-primary/20">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span className="text-sm text-gray-300">Hızlı Erişim</span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 animate-shake">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Email */}
                  <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email Adresi
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  {/* Password */}
                  <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      <Lock className="inline h-4 w-4 mr-2" />
                      Şifre
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 glass rounded-lg border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-transparent mr-2"
                    />
                    Beni hatırla
                  </label>
                  <Link href="/forgot-password" className="text-primary hover:text-secondary transition-colors">
                    Şifremi unuttum
                  </Link>
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
                      <span>Giriş yapılıyor...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Giriş Yap</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Back Link */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
