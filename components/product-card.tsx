'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import { Sparkles, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { useState } from 'react'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  discountedPrice?: number | null
  image: string
  category: string
}

export function ProductCard({ id, name, slug, price, discountedPrice, image, category }: ProductCardProps) {
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

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative glass rounded-2xl overflow-hidden hover-glow border border-primary/10 hover:border-primary/30"
    >
      <Link href={`/products/${slug}`}>
        <div className="aspect-square relative overflow-hidden bg-muted/50">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
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
