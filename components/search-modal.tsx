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

// Mock products - gerçek uygulamada API'den gelecek
const mockProducts = [
  {
    id: '1',
    name: 'Geometrik Vazo',
    slug: 'geometrik-vazo',
    price: 299.99,
    category: 'Dekorasyon',
    image: '/placeholder.jpg'
  },
  {
    id: '2',
    name: 'Telefon Standı',
    slug: 'telefon-standi',
    price: 149.99,
    category: 'Aksesuar',
    image: '/placeholder.jpg'
  },
  {
    id: '3',
    name: 'Kulaklık Askısı',
    slug: 'kulaklik-askisi',
    price: 79.99,
    category: 'Aksesuar',
    image: '/placeholder.jpg'
  },
  {
    id: '4',
    name: 'Duvar Saati',
    slug: 'duvar-saati',
    price: 249.99,
    category: 'Dekorasyon',
    image: '/placeholder.jpg'
  },
  {
    id: '5',
    name: 'Oyuncak Araba',
    slug: 'oyuncak-araba',
    price: 89.99,
    category: 'Oyuncak',
    image: '/placeholder.jpg'
  },
  {
    id: '6',
    name: 'Kalemlik',
    slug: 'kalemlik',
    price: 49.99,
    category: 'Ev & Yaşam',
    image: '/placeholder.jpg'
  }
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(mockProducts)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on escape key
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

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(mockProducts)
    } else {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
    }
  }, [searchQuery])

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`)
    onClose()
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4 animate-slide-up">
        <div className="bg-[#0a0a0f] border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
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
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Results */}
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
                    onClick={() => handleProductClick(product.slug)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-all group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
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
