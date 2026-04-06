'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ProductCard } from '@/components/product-card'
import { ProductFilters, FilterState } from '@/components/product-filters'
import { ProductGridSkeleton } from '@/components/product-skeleton'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Grid, List, SlidersHorizontal, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    categories: [],
    sortBy: 'newest'
  })

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
      const response = await fetch('/api/products')
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

  // Apply additional filters
  let displayProducts = filteredProducts

  // Search filter
  if (searchQuery) {
    displayProducts = displayProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Category filter from advanced filters
  if (filters.categories.length > 0) {
    displayProducts = displayProducts.filter(p =>
      filters.categories.includes(p.category)
    )
  }

  // Price filter
  displayProducts = displayProducts.filter(p => {
    const price = p.discountedPrice || p.price
    return price >= filters.priceRange[0] && price <= filters.priceRange[1]
  })

  // Sort
  displayProducts = [...displayProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return (a.discountedPrice || a.price) - (b.discountedPrice || b.price)
      case 'price-desc':
        return (b.discountedPrice || b.price) - (a.discountedPrice || a.price)
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'popular':
        return (b.views || 0) - (a.views || 0)
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4 text-white">Ürünlerimiz</h1>
            <p className="text-xl text-white">
              3D baskı teknolojisi ile üretilen premium kalite ürünler
            </p>
          </div>

          {/* Search and View Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-primary/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filtreler
              </Button>

              <div className="flex gap-2 glass rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Grid görünümü"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Liste görünümü"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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

          {/* Results count */}
          <div className="mb-6 text-gray-300">
            {displayProducts.length} ürün bulundu
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 flex-shrink-0 animate-slide-in-left">
                <div className="sticky top-24">
                  <ProductFilters
                    onFilterChange={setFilters}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              {loading ? (
                <ProductGridSkeleton count={8} />
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-24 glass rounded-2xl">
                  <p className="text-xl text-white">
                    {searchQuery
                      ? `"${searchQuery}" için sonuç bulunamadı`
                      : selectedCategory === 'all'
                      ? 'Henüz ürün eklenmemiş. Admin panelden ürün ekleyebilirsiniz.'
                      : 'Bu kategoride henüz ürün bulunmuyor.'}
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-6'
                }>
                  {displayProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        discountedPrice={product.discountedPrice}
                        image={product.media[0]?.url || '/placeholder.jpg'}
                        category={product.category}
                        viewMode={viewMode}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
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
