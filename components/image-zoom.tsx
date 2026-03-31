'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, X } from 'lucide-react'

interface ImageZoomProps {
  src: string
  alt: string
}

export function ImageZoom({ src, alt }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <>
      <div
        className="relative group cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        
        {/* Zoom Icon */}
        <div className="absolute top-4 right-4 glass rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 glass rounded-full p-3 hover-glow transition-all z-10"
            onClick={() => setIsZoomed(false)}
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
              }}
            />
          </div>

          <p className="absolute bottom-4 text-white text-sm">
            Yakınlaştırmak için tıklayın • ESC ile çıkın
          </p>
        </div>
      )}
    </>
  )
}
