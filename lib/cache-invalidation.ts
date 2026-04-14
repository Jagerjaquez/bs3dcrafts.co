'use client'

import { mutate } from 'swr'

/**
 * Cache invalidation utilities for SWR
 * These functions help invalidate specific cache keys when content is updated
 */

// Cache key patterns
export const CACHE_KEYS = {
  HOMEPAGE: '/api/content/homepage',
  NAVIGATION: '/api/content/navigation',
  SETTINGS: '/api/content/settings',
  PAGE: (slug: string) => `/api/content/pages/${slug}`,
  PAGES: '/api/admin/pages',
  PRODUCTS: '/api/admin/products',
  MEDIA: '/api/admin/media',
  ORDERS: '/api/admin/orders',
} as const

/**
 * Invalidate homepage content cache
 * Call this after updating homepage sections
 */
export async function invalidateHomepageCache() {
  await mutate(CACHE_KEYS.HOMEPAGE)
}

/**
 * Invalidate navigation cache
 * Call this after updating header/footer navigation
 */
export async function invalidateNavigationCache() {
  await mutate(CACHE_KEYS.NAVIGATION)
}

/**
 * Invalidate settings cache
 * Call this after updating site settings
 */
export async function invalidateSettingsCache() {
  await mutate(CACHE_KEYS.SETTINGS)
}

/**
 * Invalidate specific page cache
 * Call this after updating a page
 */
export async function invalidatePageCache(slug: string) {
  await mutate(CACHE_KEYS.PAGE(slug))
}

/**
 * Invalidate all content caches
 * Call this for major updates that affect multiple areas
 */
export async function invalidateAllContentCache() {
  await Promise.all([
    mutate(CACHE_KEYS.HOMEPAGE),
    mutate(CACHE_KEYS.NAVIGATION),
    mutate(CACHE_KEYS.SETTINGS),
  ])
}

/**
 * Invalidate admin caches
 * Call this after admin operations
 */
export async function invalidateAdminCache() {
  await Promise.all([
    mutate(CACHE_KEYS.PAGES),
    mutate(CACHE_KEYS.PRODUCTS),
    mutate(CACHE_KEYS.MEDIA),
    mutate(CACHE_KEYS.ORDERS),
  ])
}

/**
 * Preload content for better performance
 * Call this to prefetch content before navigation
 */
export async function preloadContent() {
  await Promise.all([
    mutate(CACHE_KEYS.HOMEPAGE),
    mutate(CACHE_KEYS.NAVIGATION),
    mutate(CACHE_KEYS.SETTINGS),
  ])
}

/**
 * Clear all SWR cache
 * Use with caution - this clears everything
 */
export async function clearAllCache() {
  // Clear known cache keys
  const knownKeys = [
    CACHE_KEYS.HOMEPAGE,
    CACHE_KEYS.NAVIGATION,
    CACHE_KEYS.SETTINGS,
    CACHE_KEYS.PAGES,
    CACHE_KEYS.PRODUCTS,
    CACHE_KEYS.MEDIA,
    CACHE_KEYS.ORDERS,
  ]
  
  await Promise.all(knownKeys.map(key => mutate(key, undefined)))
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  // Return known cache information
  return {
    size: 7, // Known cache keys
    keys: [
      CACHE_KEYS.HOMEPAGE,
      CACHE_KEYS.NAVIGATION,
      CACHE_KEYS.SETTINGS,
      CACHE_KEYS.PAGES,
      CACHE_KEYS.PRODUCTS,
      CACHE_KEYS.MEDIA,
      CACHE_KEYS.ORDERS,
    ],
  }
}

/**
 * Hook for cache management in components
 */
export function useCacheInvalidation() {
  return {
    invalidateHomepage: invalidateHomepageCache,
    invalidateNavigation: invalidateNavigationCache,
    invalidateSettings: invalidateSettingsCache,
    invalidatePage: invalidatePageCache,
    invalidateAllContent: invalidateAllContentCache,
    invalidateAdmin: invalidateAdminCache,
    preloadContent,
    clearAll: clearAllCache,
    getStats: getCacheStats,
  }
}