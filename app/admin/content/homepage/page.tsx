'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'
import { invalidateHomepageCache } from '@/lib/cache-invalidation'
import { Upload, Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ContentSkeleton } from '@/components/content-skeleton'

interface HeroSection {
  title: string
  description: string
  buttonText: string
  buttonUrl: string
  backgroundImage: string
}

interface CarouselItem {
  id: string
  image: string
  title: string
  description: string
  link: string
  order: number
}

interface Testimonial {
  id: string
  name: string
  role: string
  comment: string
  rating: number
  avatar: string
}

interface StatsSection {
  productsCount: number
  customersCount: number
  projectsCount: number
}

interface NewsletterSection {
  title: string
  description: string
  placeholder: string
  buttonText: string
}

interface HomepageContent {
  hero: HeroSection
  carousel: CarouselItem[]
  testimonials: Testimonial[]
  stats: StatsSection
  newsletter: NewsletterSection
}

export default function HomepageContentEditor() {
  const [content, setContent] = useState<HomepageContent>({
    hero: {
      title: '',
      description: '',
      buttonText: '',
      buttonUrl: '',
      backgroundImage: ''
    },
    carousel: [],
    testimonials: [],
    stats: {
      productsCount: 0,
      customersCount: 0,
      projectsCount: 0
    },
    newsletter: {
      title: '',
      description: '',
      placeholder: '',
      buttonText: ''
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  const loadContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content', { credentials: 'include' })
      if (!res.ok) return
      
      const rows = await res.json()
      const homepageRows = rows.filter((r: any) => r.section === 'homepage')
      
      const newContent = { ...content }
      
      homepageRows.forEach((row: any) => {
        const { key, value } = row
        
        if (key.startsWith('hero.')) {
          const field = key.replace('hero.', '')
          if (field in newContent.hero) {
            ;(newContent.hero as any)[field] = value?.text || value || ''
          }
        } else if (key === 'carousel') {
          newContent.carousel = Array.isArray(value) ? value : []
        } else if (key === 'testimonials') {
          newContent.testimonials = Array.isArray(value) ? value : []
        } else if (key.startsWith('stats.')) {
          const field = key.replace('stats.', '')
          if (field in newContent.stats) {
            ;(newContent.stats as any)[field] = parseInt(value?.text || value || '0')
          }
        } else if (key.startsWith('newsletter.')) {
          const field = key.replace('newsletter.', '')
          if (field in newContent.newsletter) {
            ;(newContent.newsletter as any)[field] = value?.text || value || ''
          }
        }
      })
      
      setContent(newContent)
    } catch (error) {
      showError('Yükleme hatası', 'İçerik yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const uploadImage = async (file: File): Promise<string> => {
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
      throw new Error('Resim yüklenemedi')
    }
    
    const result = await res.json()
    return result.data.url
  }

  const handleImageUpload = async (file: File, section: string, itemId?: string) => {
    setUploadingImage(section + (itemId || ''))
    try {
      const url = await uploadImage(file)
      
      if (section === 'hero') {
        setContent(prev => ({
          ...prev,
          hero: { ...prev.hero, backgroundImage: url }
        }))
      } else if (section === 'carousel' && itemId) {
        setContent(prev => ({
          ...prev,
          carousel: prev.carousel.map(item => 
            item.id === itemId ? { ...item, image: url } : item
          )
        }))
      } else if (section === 'testimonial' && itemId) {
        setContent(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(item => 
            item.id === itemId ? { ...item, avatar: url } : item
          )
        }))
      }
      
      showSuccess('Başarılı', 'Resim yüklendi')
    } catch (error) {
      showError('Hata', 'Resim yüklenirken hata oluştu')
    } finally {
      setUploadingImage(null)
    }
  }

  const saveContent = async () => {
    setSaving(true)
    try {
      // Save hero section
      const heroFields = [
        { key: 'hero.title', value: { text: content.hero.title } },
        { key: 'hero.description', value: { text: content.hero.description } },
        { key: 'hero.buttonText', value: { text: content.hero.buttonText } },
        { key: 'hero.buttonUrl', value: { text: content.hero.buttonUrl } },
        { key: 'hero.backgroundImage', value: { text: content.hero.backgroundImage } }
      ]
      
      for (const field of heroFields) {
        await saveField(field.key, field.value)
      }
      
      // Save carousel
      await saveField('carousel', content.carousel)
      
      // Save testimonials
      await saveField('testimonials', content.testimonials)
      
      // Save stats
      const statsFields = [
        { key: 'stats.productsCount', value: { text: content.stats.productsCount.toString() } },
        { key: 'stats.customersCount', value: { text: content.stats.customersCount.toString() } },
        { key: 'stats.projectsCount', value: { text: content.stats.projectsCount.toString() } }
      ]
      
      for (const field of statsFields) {
        await saveField(field.key, field.value)
      }
      
      // Save newsletter
      const newsletterFields = [
        { key: 'newsletter.title', value: { text: content.newsletter.title } },
        { key: 'newsletter.description', value: { text: content.newsletter.description } },
        { key: 'newsletter.placeholder', value: { text: content.newsletter.placeholder } },
        { key: 'newsletter.buttonText', value: { text: content.newsletter.buttonText } }
      ]
      
      for (const field of newsletterFields) {
        await saveField(field.key, field.value)
      }
      
      // Invalidate homepage cache to refresh frontend
      await invalidateHomepageCache()
      
      showSuccess('Başarılı', 'Ana sayfa içeriği kaydedildi')
    } catch (error) {
      showError('Hata', 'Kaydetme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const saveField = async (key: string, value: any) => {
    const res = await fetch(`/api/admin/content/${encodeURIComponent(key)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: adminJsonHeaders(),
      body: JSON.stringify({ value })
    })
    
    if (res.status === 404) {
      // Create new field
      await fetch('/api/admin/content', {
        method: 'POST',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          key,
          section: 'homepage',
          value
        })
      })
    } else if (!res.ok) {
      throw new Error(`Failed to save ${key}`)
    }
  }

  const addCarouselItem = () => {
    const newItem: CarouselItem = {
      id: Date.now().toString(),
      image: '',
      title: '',
      description: '',
      link: '',
      order: content.carousel.length
    }
    
    setContent(prev => ({
      ...prev,
      carousel: [...prev.carousel, newItem]
    }))
  }

  const removeCarouselItem = (id: string) => {
    setContent(prev => ({
      ...prev,
      carousel: prev.carousel.filter(item => item.id !== id)
    }))
  }

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      comment: '',
      rating: 5,
      avatar: ''
    }
    
    setContent(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }))
  }

  const removeTestimonial = (id: string) => {
    setContent(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(item => item.id !== id)
    }))
  }

  const onCarouselDragEnd = (fromIndex: number, toIndex: number) => {
    const items = Array.from(content.carousel)
    const [reorderedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, reorderedItem)
    
    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))
    
    setContent(prev => ({
      ...prev,
      carousel: updatedItems
    }))
  }

  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="h-10 w-96 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <ContentSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Ana Sayfa İçerik Yönetimi</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
            Önizleme
          </Button>
          <Button onClick={saveContent} disabled={saving} className="min-w-[100px]">
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Hero Bölümü</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Başlık</label>
            <Input
              value={content.hero.title}
              onChange={(e) => setContent(prev => ({
                ...prev,
                hero: { ...prev.hero, title: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="Ana başlık"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Açıklama</label>
            <Textarea
              value={content.hero.description}
              onChange={(e) => setContent(prev => ({
                ...prev,
                hero: { ...prev.hero, description: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="Hero açıklaması"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Buton Metni</label>
              <Input
                value={content.hero.buttonText}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  hero: { ...prev.hero, buttonText: e.target.value }
                }))}
                className="bg-black/20 border-primary/20 text-white"
                placeholder="Buton metni"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Buton URL</label>
              <Input
                value={content.hero.buttonUrl}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  hero: { ...prev.hero, buttonUrl: e.target.value }
                }))}
                className="bg-black/20 border-primary/20 text-white"
                placeholder="/products"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Arkaplan Resmi</label>
            <div className="flex items-center gap-4">
              {content.hero.backgroundImage && (
                <img 
                  src={content.hero.backgroundImage} 
                  alt="Hero background" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'hero')
                  }}
                  className="hidden"
                  id="hero-image"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('hero-image')?.click()}
                  disabled={uploadingImage === 'hero'}
                  className="min-w-[120px]"
                >
                  {uploadingImage === 'hero' ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Resim Yükle
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carousel Section */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Carousel Bölümü</CardTitle>
            <Button onClick={addCarouselItem} size="sm">
              <Plus className="h-4 w-4" />
              Öğe Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.carousel.map((item, index) => (
              <div
                key={item.id}
                className="glass border border-primary/10 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>
                            
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm text-gray-300 mb-2 block">Başlık</label>
                                  <Input
                                    value={item.title}
                                    onChange={(e) => setContent(prev => ({
                                      ...prev,
                                      carousel: prev.carousel.map(c => 
                                        c.id === item.id ? { ...c, title: e.target.value } : c
                                      )
                                    }))}
                                    className="bg-black/20 border-primary/20 text-white"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-sm text-gray-300 mb-2 block">Link</label>
                                  <Input
                                    value={item.link}
                                    onChange={(e) => setContent(prev => ({
                                      ...prev,
                                      carousel: prev.carousel.map(c => 
                                        c.id === item.id ? { ...c, link: e.target.value } : c
                                      )
                                    }))}
                                    className="bg-black/20 border-primary/20 text-white"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm text-gray-300 mb-2 block">Açıklama</label>
                                <Textarea
                                  value={item.description}
                                  onChange={(e) => setContent(prev => ({
                                    ...prev,
                                    carousel: prev.carousel.map(c => 
                                      c.id === item.id ? { ...c, description: e.target.value } : c
                                    )
                                  }))}
                                  className="bg-black/20 border-primary/20 text-white"
                                  rows={2}
                                />
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt="Carousel item" 
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleImageUpload(file, 'carousel', item.id)
                                    }}
                                    className="hidden"
                                    id={`carousel-image-${item.id}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById(`carousel-image-${item.id}`)?.click()}
                                    disabled={uploadingImage === `carousel${item.id}`}
                                    className="min-w-[100px]"
                                  >
                                    {uploadingImage === `carousel${item.id}` ? (
                                      <>
                                        <LoadingSpinner size="sm" />
                                        Yükleniyor...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4" />
                                        Resim
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCarouselItem(item.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

      {/* Stats Section */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Ürün Sayısı</label>
              <Input
                type="number"
                value={content.stats.productsCount}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, productsCount: parseInt(e.target.value) || 0 }
                }))}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Müşteri Sayısı</label>
              <Input
                type="number"
                value={content.stats.customersCount}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, customersCount: parseInt(e.target.value) || 0 }
                }))}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Proje Sayısı</label>
              <Input
                type="number"
                value={content.stats.projectsCount}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, projectsCount: parseInt(e.target.value) || 0 }
                }))}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Müşteri Yorumları</CardTitle>
            <Button onClick={addTestimonial} size="sm">
              <Plus className="h-4 w-4" />
              Yorum Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.testimonials.map((testimonial) => (
            <div key={testimonial.id} className="glass border border-primary/10 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">İsim</label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          testimonials: prev.testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, name: e.target.value } : t
                          )
                        }))}
                        className="bg-black/20 border-primary/20 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Rol</label>
                      <Input
                        value={testimonial.role}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          testimonials: prev.testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, role: e.target.value } : t
                          )
                        }))}
                        className="bg-black/20 border-primary/20 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Yorum</label>
                    <Textarea
                      value={testimonial.comment}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        testimonials: prev.testimonials.map(t => 
                          t.id === testimonial.id ? { ...t, comment: e.target.value } : t
                        )
                      }))}
                      className="bg-black/20 border-primary/20 text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Puan</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          testimonials: prev.testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, rating: parseInt(e.target.value) || 5 } : t
                          )
                        }))}
                        className="bg-black/20 border-primary/20 text-white w-20"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {testimonial.avatar && (
                        <img 
                          src={testimonial.avatar} 
                          alt="Avatar" 
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'testimonial', testimonial.id)
                          }}
                          className="hidden"
                          id={`testimonial-avatar-${testimonial.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`testimonial-avatar-${testimonial.id}`)?.click()}
                          disabled={uploadingImage === `testimonial${testimonial.id}`}
                          className="min-w-[100px]"
                        >
                          {uploadingImage === `testimonial${testimonial.id}` ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Yükleniyor...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Avatar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Newsletter Section */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">Newsletter Bölümü</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Başlık</label>
            <Input
              value={content.newsletter.title}
              onChange={(e) => setContent(prev => ({
                ...prev,
                newsletter: { ...prev.newsletter, title: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="Newsletter başlığı"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Açıklama</label>
            <Textarea
              value={content.newsletter.description}
              onChange={(e) => setContent(prev => ({
                ...prev,
                newsletter: { ...prev.newsletter, description: e.target.value }
              }))}
              className="bg-black/20 border-primary/20 text-white"
              placeholder="Newsletter açıklaması"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Input Placeholder</label>
              <Input
                value={content.newsletter.placeholder}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, placeholder: e.target.value }
                }))}
                className="bg-black/20 border-primary/20 text-white"
                placeholder="E-posta adresiniz"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Buton Metni</label>
              <Input
                value={content.newsletter.buttonText}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, buttonText: e.target.value }
                }))}
                className="bg-black/20 border-primary/20 text-white"
                placeholder="Abone Ol"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}