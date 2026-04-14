'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'
import { Upload, Save, Eye, Plus, Trash2 } from 'lucide-react'

interface BrandingData {
  logo: {
    url: string
    alt: string
  }
  footer: {
    companyName: string
    description: string
    copyright: string
  }
  contact: {
    phone: string
    email: string
    address: string
    whatsapp: string
  }
  socialMedia: {
    instagram: string
    twitter: string
    facebook: string
    linkedin: string
    youtube: string
  }
}

interface SocialMediaLink {
  platform: string
  url: string
  label: string
}

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/hesabiniz' },
  { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/hesabiniz' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/hesabiniz' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/hesabiniz' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@hesabiniz' }
]

export default function BrandingEditor() {
  const [branding, setBranding] = useState<BrandingData>({
    logo: {
      url: '',
      alt: ''
    },
    footer: {
      companyName: '',
      description: '',
      copyright: ''
    },
    contact: {
      phone: '',
      email: '',
      address: '',
      whatsapp: ''
    },
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const { showSuccess, showError } = useToast()

  const loadBranding = async () => {
    setLoading(true)
    try {
      // Load from settings API
      const res = await fetch('/api/admin/settings', { credentials: 'include' })
      if (!res.ok) return
      
      const settings = await res.json()
      const newBranding = { ...branding }
      
      // Map settings to branding structure
      Object.entries(settings).forEach(([key, value]: [string, any]) => {
        const stringValue = typeof value === 'string' ? value : value?.text || ''
        
        if (key === 'site.logo') {
          newBranding.logo.url = stringValue
        } else if (key === 'site.logoAlt') {
          newBranding.logo.alt = stringValue
        } else if (key === 'company.name') {
          newBranding.footer.companyName = stringValue
        } else if (key === 'company.description') {
          newBranding.footer.description = stringValue
        } else if (key === 'company.copyright') {
          newBranding.footer.copyright = stringValue
        } else if (key === 'contact.phone') {
          newBranding.contact.phone = stringValue
        } else if (key === 'contact.email') {
          newBranding.contact.email = stringValue
        } else if (key === 'contact.address') {
          newBranding.contact.address = stringValue
        } else if (key === 'contact.whatsapp') {
          newBranding.contact.whatsapp = stringValue
        } else if (key.startsWith('social.')) {
          const platform = key.replace('social.', '')
          if (platform in newBranding.socialMedia) {
            ;(newBranding.socialMedia as any)[platform] = stringValue
          }
        }
      })
      
      setBranding(newBranding)
    } catch (error) {
      showError('Yükleme hatası', 'Marka bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranding()
  }, [])

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: formData
      })
      
      if (!res.ok) {
        throw new Error('Logo yüklenemedi')
      }
      
      const result = await res.json()
      setBranding(prev => ({
        ...prev,
        logo: { ...prev.logo, url: result.data.url }
      }))
      
      showSuccess('Başarılı', 'Logo yüklendi')
    } catch (error) {
      showError('Hata', 'Logo yüklenirken hata oluştu')
    } finally {
      setUploadingLogo(false)
    }
  }

  const saveBranding = async () => {
    setSaving(true)
    try {
      const settingsToSave = [
        { key: 'site.logo', value: branding.logo.url, category: 'branding' },
        { key: 'site.logoAlt', value: branding.logo.alt, category: 'branding' },
        { key: 'company.name', value: branding.footer.companyName, category: 'company' },
        { key: 'company.description', value: branding.footer.description, category: 'company' },
        { key: 'company.copyright', value: branding.footer.copyright, category: 'company' },
        { key: 'contact.phone', value: branding.contact.phone, category: 'contact' },
        { key: 'contact.email', value: branding.contact.email, category: 'contact' },
        { key: 'contact.address', value: branding.contact.address, category: 'contact' },
        { key: 'contact.whatsapp', value: branding.contact.whatsapp, category: 'contact' },
        { key: 'social.instagram', value: branding.socialMedia.instagram, category: 'social' },
        { key: 'social.twitter', value: branding.socialMedia.twitter, category: 'social' },
        { key: 'social.facebook', value: branding.socialMedia.facebook, category: 'social' },
        { key: 'social.linkedin', value: branding.socialMedia.linkedin, category: 'social' },
        { key: 'social.youtube', value: branding.socialMedia.youtube, category: 'social' }
      ]
      
      // Save all settings
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          settings: settingsToSave.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
          }, {} as Record<string, string>)
        })
      })
      
      if (!res.ok) {
        throw new Error('Kaydetme başarısız')
      }
      
      showSuccess('Başarılı', 'Marka bilgileri kaydedildi')
    } catch (error) {
      showError('Hata', 'Kaydetme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUrl = (url: string) => {
    if (!url) return true // Empty URLs are allowed
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validatePhone = (phone: string) => {
    if (!phone) return true // Empty phone is allowed
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  if (loading) {
    return <div className="text-white">Yükleniyor...</div>
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Marka ve Logo Yönetimi</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
            Önizleme
          </Button>
          <Button onClick={saveBranding} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Logo Section */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Site Logosu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {branding.logo.url ? (
                <div className="relative">
                  <img 
                    src={branding.logo.url} 
                    alt={branding.logo.alt || 'Site logosu'} 
                    className="w-32 h-32 object-contain bg-white/10 rounded-lg p-4"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="h-4 w-4" />
                      Değiştir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Logo yükle</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadLogo(file)
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploadingLogo}
                >
                  <Upload className="h-4 w-4" />
                  {uploadingLogo ? 'Yükleniyor...' : 'Logo Yükle'}
                </Button>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Logo Alt Metni (SEO)</label>
                <Input
                  value={branding.logo.alt}
                  onChange={(e) => setBranding(prev => ({
                    ...prev,
                    logo: { ...prev.logo, alt: e.target.value }
                  }))}
                  className="bg-black/20 border-primary/20 text-white"
                  placeholder="Site logosu açıklaması"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Content */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Footer İçeriği</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Şirket Adı</label>
            <Input
              value={branding.footer.companyName}
              onChange={(e) => setBranding(prev => ({
                ...prev,
                footer: { ...prev.footer, companyName: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="BS3DCrafts"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Şirket Açıklaması</label>
            <Textarea
              value={branding.footer.description}
              onChange={(e) => setBranding(prev => ({
                ...prev,
                footer: { ...prev.footer, description: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="Şirket hakkında kısa açıklama"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Telif Hakkı Metni</label>
            <Input
              value={branding.footer.copyright}
              onChange={(e) => setBranding(prev => ({
                ...prev,
                footer: { ...prev.footer, copyright: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="© 2024 BS3DCrafts. Tüm hakları saklıdır."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">İletişim Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Telefon</label>
              <Input
                value={branding.contact.phone}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value }
                }))}
                className={`bg-black/20 border-primary/20 text-white ${
                  branding.contact.phone && !validatePhone(branding.contact.phone) 
                    ? 'border-red-500' 
                    : ''
                }`}
                placeholder="+90 555 123 45 67"
              />
              {branding.contact.phone && !validatePhone(branding.contact.phone) && (
                <p className="text-red-400 text-xs mt-1">Geçerli bir telefon numarası girin</p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">E-posta</label>
              <Input
                type="email"
                value={branding.contact.email}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value }
                }))}
                className={`bg-black/20 border-primary/20 text-white ${
                  branding.contact.email && !validateEmail(branding.contact.email) 
                    ? 'border-red-500' 
                    : ''
                }`}
                placeholder="info@bs3dcrafts.com"
              />
              {branding.contact.email && !validateEmail(branding.contact.email) && (
                <p className="text-red-400 text-xs mt-1">Geçerli bir e-posta adresi girin</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">WhatsApp Numarası</label>
            <Input
              value={branding.contact.whatsapp}
              onChange={(e) => setBranding(prev => ({
                ...prev,
                contact: { ...prev.contact, whatsapp: e.target.value }
              }))}
              className={`bg-black/20 border-primary/20 text-white ${
                branding.contact.whatsapp && !validatePhone(branding.contact.whatsapp) 
                  ? 'border-red-500' 
                  : ''
              }`}
              placeholder="+90 555 123 45 67"
            />
            {branding.contact.whatsapp && !validatePhone(branding.contact.whatsapp) && (
              <p className="text-red-400 text-xs mt-1">Geçerli bir WhatsApp numarası girin</p>
            )}
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Adres</label>
            <Textarea
              value={branding.contact.address}
              onChange={(e) => setBranding(prev => ({
                ...prev,
                contact: { ...prev.contact, address: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="Şirket adresi"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Sosyal Medya Bağlantıları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key}>
              <label className="text-sm text-gray-300 mb-2 block">{platform.label}</label>
              <Input
                value={(branding.socialMedia as any)[platform.key]}
                onChange={(e) => setBranding(prev => ({
                  ...prev,
                  socialMedia: { 
                    ...prev.socialMedia, 
                    [platform.key]: e.target.value 
                  }
                }))}
                className={`bg-black/20 border-primary/20 text-white ${
                  (branding.socialMedia as any)[platform.key] && 
                  !validateUrl((branding.socialMedia as any)[platform.key]) 
                    ? 'border-red-500' 
                    : ''
                }`}
                placeholder={platform.placeholder}
              />
              {(branding.socialMedia as any)[platform.key] && 
               !validateUrl((branding.socialMedia as any)[platform.key]) && (
                <p className="text-red-400 text-xs mt-1">Geçerli bir URL girin</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}