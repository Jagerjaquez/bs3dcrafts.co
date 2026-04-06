'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Environment Variables', status: 'pending' },
    { name: 'Database Connection', status: 'pending' },
    { name: 'Supabase Storage', status: 'pending' },
    { name: 'Stripe Configuration', status: 'pending' },
    { name: 'Admin API', status: 'pending' },
    { name: 'Product API', status: 'pending' },
    { name: 'SEO - Sitemap', status: 'pending' },
    { name: 'SEO - Robots.txt', status: 'pending' },
    { name: 'SEO - Meta Tags', status: 'pending' },
  ])
  const [running, setRunning] = useState(false)

  const updateTest = (index: number, status: 'success' | 'error', message?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ))
  }

  const runTests = async () => {
    setRunning(true)

    // Test 1: Environment Variables
    try {
      const res = await fetch('/api/test-env')
      const data = await res.json()
      if (data.hasStripeSecret && data.hasDatabase && data.hasSupabase) {
        updateTest(0, 'success', 'Tüm environment variables mevcut')
      } else {
        updateTest(0, 'error', 'Bazı environment variables eksik')
      }
    } catch (error) {
      updateTest(0, 'error', 'Test başarısız')
    }

    // Test 2: Database Connection (public ürün API üzerinden)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        updateTest(1, 'success', 'Database bağlantısı çalışıyor')
      } else {
        updateTest(1, 'error', 'Database bağlantısı başarısız')
      }
    } catch (error) {
      updateTest(1, 'error', 'Database erişilemedi')
    }

    // Test 3: Supabase Storage
    try {
      const testBlob = new Blob(['test'], { type: 'image/png' })
      const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
      const formData = new FormData()
      formData.append('file', testFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (res.ok) {
        updateTest(2, 'success', 'Supabase storage çalışıyor')
      } else {
        const data = await res.json()
        updateTest(2, 'error', data.error || 'Storage hatası')
      }
    } catch (error) {
      updateTest(2, 'error', 'Storage test başarısız')
    }

    // Test 4: Stripe Configuration
    try {
      const res = await fetch('/api/test-stripe')
      const data = await res.json()
      if (data.status === 'success') {
        updateTest(3, 'success', 'Stripe bağlantısı çalışıyor')
      } else {
        updateTest(3, 'error', data.message || 'Stripe hatası')
      }
    } catch (error) {
      updateTest(3, 'error', 'Stripe test başarısız')
    }

    // Test 5: Admin API (girişsiz 401 beklenir)
    try {
      const res = await fetch('/api/admin/products')
      if (res.status === 401) {
        updateTest(4, 'success', 'Admin API korumalı (401)')
      } else if (res.ok) {
        updateTest(4, 'success', 'Admin API oturum ile erişilebilir')
      } else {
        updateTest(4, 'error', `Admin API beklenmeyen durum: ${res.status}`)
      }
    } catch (error) {
      updateTest(4, 'error', 'Admin API erişilemedi')
    }

    // Test 6: Public Product API
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        updateTest(5, 'success', `${Array.isArray(data) ? data.length : 0} yayın ürün`)
      } else {
        updateTest(5, 'error', 'Public ürün API hatası')
      }
    } catch (error) {
      updateTest(5, 'error', 'Product API erişilemedi')
    }

    // Test 7: SEO - Sitemap
    try {
      const res = await fetch('/sitemap.xml')
      if (res.ok) {
        updateTest(6, 'success', 'Sitemap.xml mevcut')
      } else {
        updateTest(6, 'error', 'Sitemap.xml bulunamadı')
      }
    } catch (error) {
      updateTest(6, 'error', 'Sitemap test başarısız')
    }

    // Test 8: SEO - Robots.txt
    try {
      const res = await fetch('/robots.txt')
      if (res.ok) {
        updateTest(7, 'success', 'Robots.txt mevcut')
      } else {
        updateTest(7, 'error', 'Robots.txt bulunamadı')
      }
    } catch (error) {
      updateTest(7, 'error', 'Robots.txt test başarısız')
    }

    // Test 9: SEO - Meta Tags
    try {
      const metaTags = document.querySelector('meta[property="og:title"]')
      if (metaTags) {
        updateTest(8, 'success', 'Open Graph tags mevcut')
      } else {
        updateTest(8, 'error', 'Meta tags eksik')
      }
    } catch (error) {
      updateTest(8, 'error', 'Meta tags test başarısız')
    }

    setRunning(false)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🧪 Production Test Suite</h1>
          <p className="text-gray-400">
            Tüm kritik sistemleri test edin ve deployment hazırlığını kontrol edin.
          </p>
        </div>

        <div className="glass border border-primary/20 rounded-lg p-6 mb-6">
          <Button 
            onClick={runTests} 
            disabled={running}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            {running ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Testler Çalışıyor...
              </>
            ) : (
              'Tüm Testleri Çalıştır'
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <div 
              key={index}
              className="glass border border-primary/20 rounded-lg p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{test.name}</h3>
                {test.message && (
                  <p className="text-sm text-gray-400">{test.message}</p>
                )}
              </div>
              <div className="ml-4">
                {test.status === 'pending' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">-</span>
                  </div>
                )}
                {test.status === 'success' && (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
                {test.status === 'error' && (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 glass border border-primary/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">📋 Deployment Checklist</h2>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Environment Variables Configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Database Migrated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Security Headers Added</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Deployed to Vercel</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>SEO - Sitemap.xml</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>SEO - Robots.txt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>SEO - Open Graph Tags</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>SEO - Structured Data (JSON-LD)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Legal Pages (Terms, Privacy, FAQ)</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-500" />
              <span>Stripe Webhook Configured (Geçici bypass aktif)</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-500" />
              <span>PayTR Merchant Approval (Beklemede)</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-yellow-500" />
              <span>Monitoring/Analytics (Opsiyonel)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">ℹ️ Not</h3>
          <p className="text-blue-300 text-sm">
            Bu test sayfası production sistemlerinizi kontrol eder. Tüm testler yeşil olmalıdır.
            Kırmızı testler varsa ilgili dokümantasyona bakın ve sorunları çözün.
          </p>
        </div>

        <div className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Tamamlanan SEO İyileştirmeleri</h3>
          <ul className="text-green-300 text-sm space-y-1">
            <li>• Sitemap.xml oluşturuldu (otomatik güncellenir)</li>
            <li>• Robots.txt eklendi</li>
            <li>• Open Graph tags eklendi</li>
            <li>• Twitter Card tags eklendi</li>
            <li>• Structured Data (JSON-LD) eklendi</li>
            <li>• Meta keywords ve description optimize edildi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
