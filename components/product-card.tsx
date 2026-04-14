'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import { Sparkles, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { LazyImage } from './ui/lazy-image'
import { useState } from 'react'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  discountedPrice?: number | null
  image: string
  category: string
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ id, name, slug, price, discountedPrice, image, category, viewMode = 'grid' }: ProductCardProps) {
  const finalPrice = discountedPrice || price
  const hasDiscount = discountedPrice && discountedPrice < price
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addItem({
      id,
      name,
      price: finalPrice,
      image
    })
    setTimeout(() => setIsAdding(false), 1000)
  }

  // List view
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 8 }}
        transition={{ duration: 0.3 }}
        className="group relative glass rounded-2xl overflow-hidden hover-glow border border-primary/10 hover:border-primary/30"
      >
        <Link href={`/products/${slug}`} className="flex gap-6 p-6">
          <div className="w-48 h-48 relative overflow-hidden rounded-xl flex-shrink-0 bg-muted/50">
            <LazyImage
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              priority={false}
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 192px"
            />
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-destructive to-destructive/80 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse-glow">
                <Sparkles className="h-3 w-3" />
                İndirim
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-white uppercase tracking-wider mb-2 font-semibold">{category}</p>
              <h3 className="font-bold text-2xl mb-3 text-white group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-gray-400 line-clamp-2">
                Premium kalite 3D baskı ürünü. Detaylı bilgi için ürün sayfasını ziyaret edin.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>
                )}
                <span className="text-3xl font-bold gradient-text">{formatPrice(finalPrice)}</span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow px-8"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isAdding ? 'Eklendi!' : 'Sepete Ekle'}
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Grid view (default)
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative glass rounded-2xl overflow-hidden hover-glow border border-primary/10 hover:border-primary/30"
    >
      <Link href={`/products/${slug}`}>
        <div className="aspect-square relative overflow-hidden bg-muted/50">
          <LazyImage
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            priority={false}
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-destructive to-destructive/80 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse-glow">
              <Sparkles className="h-3 w-3" />
              İndirim
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <p className="text-xs text-white uppercase tracking-wider mb-2 font-semibold">{category}</p>
          <h3 className="font-bold text-lg mb-3 line-clamp-2 text-white transition-colors">
            {name}
          </h3>
          
          <div className="flex items-center gap-2 mb-4">
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
            <span className="text-2xl font-bold gradient-text">{formatPrice(finalPrice)}</span>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-6 pb-6">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover-glow"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? 'Eklendi!' : 'Sepete Ekle'}
        </Button>
      </div>
    </motion.div>
  )
}
