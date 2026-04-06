'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

type CatalogProduct = {
  id: string
  name: string
  slug: string
  price: number
  discountedPrice: number | null
  category: string
  media?: { type: string; url: string }[]
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [searchResults, setSearchResults] = useState<CatalogProduct[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: CatalogProduct[]) => {
        if (Array.isArray(data)) {
          setCatalog(data)
          setSearchResults(data)
        }
      })
      .catch(() => {
        setCatalog([])
        setSearchResults([])
      })
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q === '') {
      setSearchResults(catalog)
      return
    }
    setSearchResults(
      catalog.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.slug.toLowerCase().includes(q)
      )
    )
  }, [searchQuery, catalog])

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`)
    onClose()
    setSearchQuery('')
  }

  const thumb = (p: CatalogProduct) => {
    const img = p.media?.find((m) => m.type === 'image')
    return img?.url || '/placeholder.jpg'
  }

  const displayPrice = (p: CatalogProduct) => p.discountedPrice ?? p.price

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4 animate-slide-up">
        <div className="bg-[#0a0a0f] border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-primary/20">
            <Search className="h-5 w-5 text-primary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4">
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <p className="text-gray-400">Sonuç bulunamadı</p>
                <p className="text-sm text-gray-500 mt-2">Farklı bir arama terimi deneyin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product.slug)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-all group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                      <Image
                        src={thumb(product)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized={thumb(product).startsWith('http')}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(displayPrice(product))}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-primary/20 p-3 bg-black/30">
            <p className="text-xs text-gray-500 text-center">
              <kbd className="px-2 py-1 bg-primary/10 rounded text-white">ESC</kbd> tuşuna basarak kapatabilirsiniz
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
