'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLazyImage } from '@/hooks/use-intersection-observer'
import { Skeleton } from './skeleton'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  placeholder = 'blur',
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  onLoad,
  onError
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const {
    ref,
    src: lazySrc,
    isLoaded,
    isError,
    hasIntersected,
    onLoad: handleLazyLoad,
    onError: handleLazyError
  } = useLazyImage(priority ? src : src)

  const handleLoad = () => {
    setImageLoaded(true)
    handleLazyLoad()
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    handleLazyError()
    onError?.()
  }

  // For priority images, load immediately
  const shouldLoad = priority || hasIntersected
  const imageSrc = shouldLoad ? (lazySrc || src) : undefined

  if (!shouldLoad) {
    return (
      <div 
        ref={ref as any}
        className={cn(
          "relative overflow-hidden bg-muted",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (imageError) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden bg-muted flex items-center justify-center text-muted-foreground text-sm",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        Failed to load image
      </div>
    )
  }

  return (
    <div 
      ref={ref as any}
      className={cn(
        "relative overflow-hidden",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      {!imageLoaded && (
        <Skeleton className={cn(
          "absolute inset-0 z-10",
          fill ? "w-full h-full" : ""
        )} />
      )}
      
      <Image
        src={imageSrc!}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}