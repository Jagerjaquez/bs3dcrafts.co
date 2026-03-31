'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { X, SlidersHorizontal } from 'lucide-react'

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onClose?: () => void
}

export interface FilterState {
  priceRange: [number, number]
  categories: string[]
  sortBy: string
}

export function ProductFilters({ onFilterChange, onClose }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')

  const categories = [
    'Dekorasyon',
    'Aksesuar',
    'Oyuncak',
    'Ev & Yaşam',
    'Figür',
    'Hediyelik'
  ]

  const sortOptions = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
    { value: 'popular', label: 'En Popüler' },
    { value: 'name-asc', label: 'İsim: A-Z' },
    { value: 'name-desc', label: 'İsim: Z-A' }
  ]

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(newCategories)
    applyFilters(priceRange, newCategories, sortBy)
  }

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    applyFilters(newRange, selectedCategories, sortBy)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    applyFilters(priceRange, selectedCategories, value)
  }

  const applyFilters = (price: [number, number], cats: string[], sort: string) => {
    onFilterChange({
      priceRange: price,
      categories: cats,
      sortBy: sort
    })
  }

  const clearFilters = () => {
    setPriceRange([0, 1000])
    setSelectedCategories([])
    setSortBy('newest')
    onFilterChange({
      priceRange: [0, 1000],
      categories: [],
      sortBy: 'newest'
    })
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-white">Filtreler</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Sıralama</label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg glass border border-primary/20 text-white focus:outline-none focus:border-primary transition-colors"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value} className="bg-gray-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Fiyat Aralığı: ₺{priceRange[0]} - ₺{priceRange[1]}
        </label>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>₺0</span>
          <span>₺1000+</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Kategoriler</label>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 rounded border-primary/20 bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full border-primary/50 hover:bg-primary/10"
      >
        Filtreleri Temizle
      </Button>
    </div>
  )
}
