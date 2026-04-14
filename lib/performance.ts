/**
 * Performance optimization utilities for the CMS
 * Implements Task 22.3: Database query optimizations
 */

import { prisma } from './prisma'

// Database query optimization utilities
export const QueryOptimizer = {
  /**
   * Get paginated results with optimized queries
   */
  async getPaginatedResults<T>(
    model: any,
    options: {
      page: number
      limit: number
      where?: any
      select?: any
      include?: any
      orderBy?: any
    }
  ): Promise<{ data: T[]; total: number; hasMore: boolean }> {
    const { page, limit, where, select, include, orderBy } = options
    const skip = (page - 1) * limit

    // Use Promise.all for parallel queries
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        select,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      model.count({ where }),
    ])

    return {
      data,
      total,
      hasMore: skip + limit < total,
    }
  },

  /**
   * Optimize product queries with minimal fields for list views
   */
  getProductListSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountedPrice: true,
      stock: true,
      category: true,
      status: true,
      featured: true,
      createdAt: true,
      updatedAt: true,
      media: {
        select: {
          id: true,
          url: true,
          type: true,
          order: true,
        },
        orderBy: { order: 'asc' as const },
        take: 1, // Only get first image for list view
      },
    }
  },

  /**
   * Optimize order queries with minimal fields for list views
   */
  getOrderListSelect() {
    return {
      id: true,
      customerName: true,
      email: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              media: {
                select: { url: true },
                take: 1,
                orderBy: { order: 'asc' as const },
              },
            },
          },
        },
      },
    }
  },

  /**
   * Optimize page queries with minimal fields
   */
  getPageListSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      // Don't include content in list views
    }
  },

  /**
   * Optimize media queries with minimal fields for list views
   */
  getMediaListSelect() {
    return {
      id: true,
      filename: true,
      url: true,
      type: true,
      size: true,
      dimensions: true,
      usageCount: true,
      uploadedAt: true,
    }
  },
}

// Cache management utilities
export const CacheManager = {
  /**
   * Generate cache tags for content invalidation
   */
  generateCacheTags(type: string, id?: string): string[] {
    const tags = [`${type}-content`, 'public-content']
    if (id) {
      tags.push(`${type}-${id}`)
    }
    return tags
  },

  /**
   * Generate ETag for content versioning
   */
  generateETag(content: any, type: string): string {
    const timestamp = content.updatedAt?.getTime() || Date.now()
    return `"${type}-${timestamp}"`
  },

  /**
   * Get cache control headers for different content types
   */
  getCacheHeaders(type: 'content' | 'settings' | 'navigation' | 'media') {
    const configs = {
      content: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, max-age=60',
        'Vary': 'Accept-Encoding',
      },
      settings: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200, max-age=300',
        'Vary': 'Accept-Encoding',
      },
      navigation: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, max-age=60',
        'Vary': 'Accept-Encoding',
      },
      media: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200, max-age=1800',
        'Vary': 'Accept-Encoding',
      },
    }

    return configs[type]
  },
}

// Performance monitoring utilities
export const PerformanceMonitor = {
  /**
   * Measure query execution time
   */
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await queryFn()
      const duration = performance.now() - start
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Query ${queryName} took ${duration.toFixed(2)}ms`)
      }
      
      // Log slow queries in production
      if (duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`Query ${queryName} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  },

  /**
   * Create a performance-optimized database connection
   */
  async healthCheck(): Promise<{
    database: boolean
    responseTime: number
  }> {
    const start = performance.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      const responseTime = performance.now() - start
      return { database: true, responseTime }
    } catch (error) {
      const responseTime = performance.now() - start
      console.error('Database health check failed:', error)
      return { database: false, responseTime }
    }
  },
}

// Image optimization utilities
export const ImageOptimizer = {
  /**
   * Generate optimized image sizes configuration
   */
  getImageSizes(context: 'product-card' | 'product-detail' | 'hero' | 'thumbnail') {
    const configs = {
      'product-card': '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      'product-detail': '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
      'hero': '100vw',
      'thumbnail': '150px',
    }
    return configs[context]
  },

  /**
   * Generate blur placeholder data URL
   */
  getBlurDataURL(): string {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  },

  /**
   * Determine if image should be loaded with priority
   */
  shouldPrioritize(context: 'above-fold' | 'below-fold' | 'hero', index?: number): boolean {
    if (context === 'hero') return true
    if (context === 'above-fold' && (index === undefined || index < 4)) return true
    return false
  },
}

// Bundle size optimization utilities
export const BundleOptimizer = {
  /**
   * Lazy load heavy components
   */
  async loadComponent<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    const module = await importFn()
    return module.default
  },

  /**
   * Preload critical resources
   */
  preloadResource(href: string, as: 'script' | 'style' | 'font' | 'image') {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      if (as === 'font') {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    }
  },
}

// API response optimization utilities
export const ResponseOptimizer = {
  /**
   * Create optimized JSON response with caching headers
   */
  createCachedResponse(data: any, type: 'content' | 'settings' | 'navigation' | 'media') {
    const headers = CacheManager.getCacheHeaders(type)
    const etag = CacheManager.generateETag(data, type)
    
    return {
      data,
      headers: {
        ...headers,
        'ETag': etag,
      },
    }
  },

  /**
   * Compress response data for better performance
   */
  compressData(data: any): any {
    // Remove null/undefined values to reduce payload size
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (value === null || value === undefined) {
        return undefined
      }
      return value
    }))
  },
}