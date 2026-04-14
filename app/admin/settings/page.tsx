'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Genel',
  contact: 'İletişim',
  social: 'Sosyal',
  email: 'E-posta',
  features: 'Özellikler',
  analytics: 'Analitik',
}

const FIELD_LABELS: Record<string, string> = {
  'site.title': 'Site Başlığı',
  'site.tagline': 'Site Sloganı',
  'site.description': 'Site Açıklaması',
  'contact.email': 'E-posta Adresi',
  'contact.phone': 'Telefon Numarası',
  'contact.whatsapp': 'WhatsApp Numarası',
  'contact.address': 'Adres',
  'social.instagram': 'Instagram URL',
  'social.twitter': 'Twitter URL',
  'social.facebook': 'Facebook URL',
  'social.linkedin': 'LinkedIn URL',
  'email.smtp_host': 'SMTP Sunucusu',
  'email.smtp_port': 'SMTP Portu',
  'email.smtp_user': 'SMTP Kullanıcı Adı',
  'email.smtp_password': 'SMTP Şifresi',
  'email.from_name': 'Gönderen Adı',
  'email.from_email': 'Gönderen E-posta',
  'analytics.google_id': 'Google Analytics ID',
  'analytics.facebook_pixel': 'Facebook Pixel ID',
  'features.newsletter': 'Haber Bülteni',
  'features.whatsapp_button': 'WhatsApp Butonu',
  'features.testimonials': 'Müşteri Yorumları',
}

const FIELD_TYPES: Record<string, 'text' | 'email' | 'url' | 'textarea' | 'password' | 'boolean'> = {
  'site.description': 'textarea',
  'contact.email': 'email',
  'contact.address': 'textarea',
  'social.instagram': 'url',
  'social.twitter': 'url',
  'social.facebook': 'url',
  'social.linkedin': 'url',
  'email.smtp_password': 'password',
  'email.from_email': 'email',
  'features.newsletter': 'boolean',
  'features.whatsapp_button': 'boolean',
  'features.testimonials': 'boolean',
}

export default function AdminSettingsPage() {
  const [grouped, setGrouped] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [resetting, setResetting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const { showSuccess, showError } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setGrouped(data)
        // Set first available category as active tab
        const categories = Object.keys(data)
        if (categories.length > 0 && !categories.includes(activeTab)) {
          setActiveTab(categories[0])
        }
      }
    } catch (error) {
      showError('Yükleme Hatası', 'Ayarlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const validateField = (key: string, value: string): string | null => {
    const type = FIELD_TYPES[key]
    
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Geçerli bir e-posta adresi giriniz'
      }
    }
    
    if (type === 'url' && value) {
      try {
        new URL(value)
      } catch {
        return 'Geçerli bir URL giriniz (http:// veya https:// ile başlamalı)'
      }
    }
    
    return null
  }

  const saveCategory = async (category: string) => {
    const settings = grouped[category]
    if (!settings) return

    // Validate all fields in category
    const errors: string[] = []
    Object.entries(settings).forEach(([key, value]) => {
      const error = validateField(key, value)
      if (error) {
        errors.push(`${FIELD_LABELS[key] || key}: ${error}`)
      }
    })

    if (errors.length > 0) {
      showError('Doğrulama Hatası', errors.join('\n'))
      return
    }

    setSaving(category)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ category, settings }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        showError('Kayıt başarısız', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
        return
      }
      showSuccess('Kaydedildi', `${CATEGORY_LABELS[category] || category} ayarları başarıyla güncellendi`)
    } catch (error) {
      showError('Kayıt Hatası', 'Ayarlar kaydedilirken bir hata oluştu')
    } finally {
      setSaving(null)
    }
  }

  const resetSetting = async (category: string, key: string) => {
    const resetKey = `${category}.${key}`
    setResetting(resetKey)
    try {
      const res = await fetch('/api/admin/settings/reset', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({ key: resetKey }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        showError('Sıfırlama başarısız', (d as { error?: string }).error || 'Bilinmeyen hata oluştu')
        return
      }
      
      // Reload settings to get the reset value
      await load()
      showSuccess('Sıfırlandı', `${FIELD_LABELS[resetKey] || key} varsayılan değerine sıfırlandı`)
    } catch (error) {
      showError('Sıfırlama Hatası', 'Ayar sıfırlanırken bir hata oluştu')
    } finally {
      setResetting(null)
    }
  }

  const updateField = (category: string, key: string, value: string | boolean) => {
    setGrouped((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: String(value) },
    }))
  }

  const renderField = (category: string, key: string, value: string) => {
    const fullKey = `${category}.${key}`
    const label = FIELD_LABELS[fullKey] || key
    const type = FIELD_TYPES[fullKey] || 'text'
    const isResetting = resetting === fullKey

    if (type === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between space-x-2">
          <Label htmlFor={fullKey} className="text-gray-300 flex-1">
            {label}
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id={fullKey}
              checked={value === 'true'}
              onCheckedChange={(checked) => updateField(category, key, checked)}
              className="data-[state=checked]:bg-primary"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => resetSetting(category, key)}
              disabled={isResetting}
              className="text-xs"
            >
              {isResetting ? 'Sıfırlanıyor...' : 'Sıfırla'}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div key={key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={fullKey} className="text-gray-300">
            {label}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resetSetting(category, key)}
            disabled={isResetting}
            className="text-xs"
          >
            {isResetting ? 'Sıfırlanıyor...' : 'Sıfırla'}
          </Button>
        </div>
        {type === 'textarea' ? (
          <Textarea
            id={fullKey}
            value={value}
            onChange={(e) => updateField(category, key, e.target.value)}
            className="bg-black/20 border-primary/20 text-white min-h-[100px]"
            placeholder={`${label} giriniz...`}
          />
        ) : (
          <Input
            id={fullKey}
            type={type === 'password' ? 'password' : type === 'email' ? 'email' : type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => updateField(category, key, e.target.value)}
            className="bg-black/20 border-primary/20 text-white"
            placeholder={`${label} giriniz...`}
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white text-lg">Ayarlar yükleniyor...</p>
      </div>
    )
  }

  const categories = Object.keys(grouped)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Site Ayarları</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-black/20 border border-primary/20">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300"
            >
              {CATEGORY_LABELS[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="glass border border-primary/20 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  {CATEGORY_LABELS[category] || category} Ayarları
                </h2>
                <Button
                  type="button"
                  onClick={() => saveCategory(category)}
                  disabled={saving === category}
                  className="bg-primary hover:bg-primary/80"
                >
                  {saving === category ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(grouped[category] || {}).map(([key, value]) =>
                  renderField(category, key, value)
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}