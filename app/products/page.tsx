'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const categories = [
  { id: 'all', name: 'Tüm Ürünler', slug: '' },
  { id: 'dekorasyon', name: 'Dekorasyon', slug: 'dekorasyon' },
  { id: 'aksesuar', name: 'Aksesuar', slug: 'aksesuar' },
  { id: 'oyuncak', name: 'Oyuncak', slug: 'oyuncak' },
  { id: 'ev', name: 'Ev & Yaşam', slug: 'ev' }
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categoryParam) {
      const category = categories.find(c => c.slug === categoryParam)
      if (category) {
        setSelectedCategory(category.id)
      }
    } else {
      setSelectedCategory('all')
    }
  }, [categoryParam])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => {
        if (selectedCategory === 'ev') return p.category === 'Ev & Yaşam'
        return p.category.toLowerCase() === selectedCategory.toLowerCase()
      })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4 text-white">Ürünlerimiz</h1>
            <p className="text-xl text-white">
              3D baskı teknolojisi ile üretilen premium kalite ürünler
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    if (category.slug) {
                      window.history.pushState({}, '', `/products?category=${category.slug}`)
                    } else {
                      window.history.pushState({}, '', '/products')
                    }
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/50 scale-105 hover-glow border-2 border-primary/50'
                      : 'glass border-2 border-primary/20 text-white hover:border-primary/40 hover:scale-105 hover-glow'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-xl text-white mt-4">Ürünler yükleniyor...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-xl text-white">
                {selectedCategory === 'all' 
                  ? 'Henüz ürün eklenmemiş. Admin panelden ürün ekleyebilirsiniz.' 
                  : 'Bu kategoride henüz ürün bulunmuyor.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    discountedPrice={product.discountedPrice}
                    image={product.media[0]?.url || '/placeholder.jpg'}
                    category={product.category}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 text-center py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-xl text-white mt-4">Sayfa yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
