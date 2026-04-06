'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Package, Clock, Weight, ChevronLeft, ChevronRight, CreditCard, Share2, Facebook, Twitter, Heart, Star, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { ImageZoom } from './image-zoom'

interface ProductDetailsProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    discountedPrice: number | null
    stock: number
    category: string
    material: string
    printTimeEstimate: string
    weight: number
    media: Array<{
      id: string
      type: string
      url: string
    }>
  }
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedInstallment, setSelectedInstallment] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const images = product.media.filter(m => m.type === 'image')
  const finalPrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  // Fetch similar products
  useEffect(() => {
    fetchSimilarProducts()
  }, [product.category])

  const fetchSimilarProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const allProducts = await response.json()
        const similar = allProducts
          .filter((p: { id: string; category: string }) => p.category === product.category && p.id !== product.id)
          .slice(0, 4)
        setSimilarProducts(similar)
      }
    } catch (error) {
      console.error('Error fetching similar products:', error)
    }
  }

  const shareProduct = (platform: string) => {
    const url = window.location.href
    const text = `${product.name} - ${formatPrice(finalPrice)}`
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    }
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
  }

  // Taksit seçenekleri
  const installmentOptions = [
    { months: 1, label: 'Tek Çekim' },
    { months: 3, label: '3 Taksit' },
    { months: 6, label: '6 Taksit' },
    { months: 9, label: '9 Taksit' },
  ]

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: images[0]?.url || '/placeholder.jpg'
    })
    setTimeout(() => setIsAdding(false), 1000)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf - Fotoğraflar ve Açıklama (2 kolon) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Kaydırılabilir Fotoğraf Galerisi */}
          <div className="space-y-4 animate-slide-up">
            <motion.div 
              className="aspect-[4/3] relative rounded-2xl overflow-hidden glass border border-primary/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {images[selectedImage] ? (
                <ImageZoom
                  src={images[selectedImage].url}
                  alt={product.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                  <Package className="h-24 w-24 text-primary/50" />
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 glass rounded-full p-3 hover-glow transition-all hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 glass rounded-full p-3 hover-glow transition-all hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-full">
                    <span className="text-sm text-white font-medium">
                      {selectedImage + 1} / {images.length}
                    </span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Thumbnail Scroll */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
                {images.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border-2 transition-all hover-glow ${
                      selectedImage === index 
                        ? 'border-primary scale-105' 
                        : 'border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={media.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ürün Açıklaması */}
          <div className="glass rounded-2xl p-8 border border-primary/20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold mb-4 text-white">Ürün Açıklaması</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Teknik Özellikler */}
            <div className="mt-8 pt-8 border-t border-primary/20">
              <h3 className="text-xl font-bold mb-6 text-white">Teknik Özellikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 rounded-lg p-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Malzeme</p>
                    <p className="font-semibold text-white">{product.material}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-secondary/20 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Üretim Süresi</p>
                    <p className="font-semibold text-white">{product.printTimeEstimate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 rounded-lg p-3">
                    <Weight className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Ağırlık</p>
                    <p className="font-semibold text-white">{product.weight}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="glass rounded-2xl p-8 border border-primary/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              Sık Sorulan Sorular
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: 'Ürün ne zaman kargoya verilir?',
                  a: 'Siparişiniz onaylandıktan sonra 2-3 iş günü içinde üretilir ve kargoya verilir.'
                },
                {
                  q: 'İade ve değişim yapabilir miyim?',
                  a: 'Ürün hasarlı veya hatalı gelirse 14 gün içinde iade edebilirsiniz. Özel üretim ürünlerde iade kabul edilmemektedir.'
                },
                {
                  q: 'Ürün özelleştirilebilir mi?',
                  a: 'Evet! Renk, boyut ve tasarım değişiklikleri için bizimle iletişime geçebilirsiniz.'
                },
                {
                  q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
                  a: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Taksit seçenekleri mevcuttur.'
                }
              ].map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 rounded-lg glass border border-primary/20 hover:border-primary/40 transition-colors">
                    <span className="font-semibold text-white">{faq.q}</span>
                    <ChevronRight className="h-5 w-5 text-primary group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-2 p-4 text-gray-300 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl font-bold mb-6 text-white">Benzer Ürünler</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((similar) => {
                  const simImg =
                    (similar.media || []).find((m: { type: string }) => m.type === 'image')?.url ||
                    '/placeholder.jpg'
                  return (
                  <Link
                    key={similar.id}
                    href={`/products/${similar.slug}`}
                    className="glass rounded-xl overflow-hidden hover-glow transition-all group"
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={simImg}
                        alt={similar.name}
                        fill
                        unoptimized={simImg.startsWith('http')}
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {similar.name}
                      </h4>
                      <p className="text-lg font-bold gradient-text">
                        {formatPrice(similar.discountedPrice || similar.price)}
                      </p>
                    </div>
                  </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Taraf - Fiyat ve Sepete Ekle Kutusu (1 kolon) */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 border border-primary/20 sticky top-24 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Kategori */}
            <div>
              <p className="text-sm text-primary uppercase tracking-wider font-semibold">
                {product.category}
              </p>
            </div>

            {/* Ürün Adı */}
            <h1 className="text-2xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Fiyat */}
            <div className="space-y-2">
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-gradient-to-r from-destructive to-destructive/80 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    İndirim
                  </span>
                </div>
              )}
              <div className="text-4xl font-bold gradient-text">
                {formatPrice(finalPrice)}
              </div>
            </div>

            {/* Taksit Seçenekleri */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-semibold">Taksit Seçenekleri</span>
              </div>
              <div className="space-y-2">
                {installmentOptions.map((option) => (
                  <button
                    key={option.months}
                    onClick={() => setSelectedInstallment(option.months)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedInstallment === option.months
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{option.label}</span>
                      <span className="text-primary font-bold">
                        {formatPrice(finalPrice / option.months)}
                      </span>
                    </div>
                    {option.months > 1 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {option.months} x {formatPrice(finalPrice / option.months)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stok Durumu */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-white font-medium">
                {product.stock > 0 ? `Stokta ${product.stock} adet` : 'Stokta yok'}
              </span>
            </div>

            {/* Sepete Ekle Butonu */}
            <Button
              size="lg"
              className="w-full text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAdding ? 'Eklendi!' : 'Sepete Ekle'}
            </Button>

            {/* Favorite Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-primary/50 hover:bg-primary/10"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
            </Button>

            {/* Social Share */}
            <div className="pt-4 border-t border-primary/20">
              <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Paylaş
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => shareProduct('facebook')}
                  className="flex-1 p-3 rounded-lg glass border border-primary/20 hover:border-primary/50 transition-colors group"
                  aria-label="Facebook'ta paylaş"
                >
                  <Facebook className="h-5 w-5 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => shareProduct('twitter')}
                  className="flex-1 p-3 rounded-lg glass border border-primary/20 hover:border-primary/50 transition-colors group"
                  aria-label="Twitter'da paylaş"
                >
                  <Twitter className="h-5 w-5 text-sky-500 mx-auto group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => shareProduct('whatsapp')}
                  className="flex-1 p-3 rounded-lg glass border border-primary/20 hover:border-primary/50 transition-colors group"
                  aria-label="WhatsApp'ta paylaş"
                >
                  <MessageCircle className="h-5 w-5 text-green-500 mx-auto group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Reviews Preview */}
            <div className="pt-4 border-t border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-300">Müşteri Değerlendirmeleri</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">(4.8)</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                127 müşteri bu ürünü değerlendirdi
              </p>
            </div>

            {/* Güvenli Alışveriş */}
            <div className="pt-4 border-t border-primary/20">
              <p className="text-xs text-gray-400 text-center">
                🔒 Güvenli ödeme altyapısı ile korumalı alışveriş
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
