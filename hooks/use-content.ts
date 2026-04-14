'use client'

import useSWR from 'swr'
import { CACHE_CONFIG } from '@/components/swr-provider'

// Types for different content endpoints
export interface HomepageData {
  hero?: {
    title?: string
    subtitle?: string
    buttonText?: string
    buttonUrl?: string
    backgroundImage?: string
    badge?: string
  }
  carousel?: Array<{
    id: string
    title: string
    description: string
    image: string
    link: string
  }>
  testimonials?: Array<{
    id: string
    name: string
    role: string
    comment: string
    rating: number
    avatar?: string
  }>
  stats?: {
    customers?: number
    products?: number
    satisfaction?: number
    support?: string
  }
  newsletter?: {
    title?: string
    subtitle?: string
    enabled?: boolean
  }
}

export interface NavigationData {
  header: Array<{
    id: string
    label: string
    url: string
    children?: Array<{
      id: string
      label: string
      url: string
    }>
  }>
  footer: Array<{
    id: string
    label: string
    url: string
  }>
}

export interface PageData {
  title: string
  content: string
  metaTitle: string
  metaDescription: string
  keywords: string
  updatedAt: string
}

export interface SiteSettings {
  siteTitle: string
  tagline: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  socialMedia: {
    instagram: string
    twitter: string
    facebook: string
  }
  features: {
    newsletter: boolean
    whatsappButton: boolean
  }
}

// Custom hook for homepage content
export function useHomepageContent() {
  const { data, error, isLoading, mutate } = useSWR<HomepageData>(
    '/api/content/homepage',
    {
      ...CACHE_CONFIG.content,
      // Fallback data for homepage
      fallbackData: {
        hero: {
          title: 'Her Katmanda Mükemmellik',
          subtitle: '3D baskı teknolojisi ile üretilen premium kalite ürünler. Her detayda mükemmellik.',
          buttonText: 'Ürünleri Keşfet',
          buttonUrl: '/products',
          badge: 'Premium 3D Printing'
        },
        testimonials: [
          {
            id: '1',
            name: 'Ahmet Yılmaz',
            role: 'Mimar',
            comment: 'Proje maketlerim için kullandığım 3D baskı hizmeti mükemmel. Detaylar harika, teslimat hızlı.',
            rating: 5
          },
          {
            id: '2', 
            name: 'Zeynep Kaya',
            role: 'Tasarımcı',
            comment: 'Özel tasarım figürler için BS3DCrafts\'ı tercih ediyorum. Kalite ve müşteri hizmetleri harika.',
            rating: 5
          }
        ]
      },
      // Enhanced error handling
      onError: (error) => {
        console.error('Homepage content fetch error:', error)
        // Don't throw error, use fallback data instead
      },
      // Retry configuration
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      // Keep previous data on error
      keepPreviousData: true,
    }
  )

  // Always return data (fallback if API fails)
  const safeData = data || {
    hero: {
      title: 'Her Katmanda Mükemmellik',
      subtitle: '3D baskı teknolojisi ile üretilen premium kalite ürünler. Her detayda mükemmellik.',
      buttonText: 'Ürünleri Keşfet',
      buttonUrl: '/products',
      badge: 'Premium 3D Printing'
    },
    testimonials: [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        role: 'Mimar',
        comment: 'Proje maketlerim için kullandığım 3D baskı hizmeti mükemmel. Detaylar harika, teslimat hızlı.',
        rating: 5
      },
      {
        id: '2', 
        name: 'Zeynep Kaya',
        role: 'Tasarımcı',
        comment: 'Özel tasarım figürler için BS3DCrafts\'ı tercih ediyorum. Kalite ve müşteri hizmetleri harika.',
        rating: 5
      }
    ]
  }

  return {
    data: safeData,
    isLoading,
    isError: !!error,
    error,
    mutate, // For manual revalidation
    // Helper to refresh data
    refresh: () => mutate(),
  }
}

// Custom hook for navigation content
export function useNavigationContent() {
  const { data, error, isLoading, mutate } = useSWR<NavigationData>(
    '/api/content/navigation',
    CACHE_CONFIG.navigation
  )

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
    refresh: () => mutate(),
  }
}

// Custom hook for page content by slug
export function usePageContent(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<PageData>(
    slug ? `/api/content/pages/${slug}` : null,
    CACHE_CONFIG.content
  )

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
    refresh: () => mutate(),
  }
}

// Custom hook for site settings
export function useSiteSettings() {
  const { data, error, isLoading, mutate } = useSWR<SiteSettings>(
    '/api/content/settings',
    {
      ...CACHE_CONFIG.settings,
      // Fallback data for settings
      fallbackData: {
        siteTitle: 'BS3DCrafts',
        tagline: 'Precision in Every Layer',
        contactEmail: 'bs3dcrafts.co@outlook.com',
        contactPhone: '+90 546 451 95 97',
        whatsappNumber: '905464519597',
        socialMedia: {
          instagram: 'https://instagram.com/bs3dcrafts',
          twitter: '',
          facebook: ''
        },
        features: {
          newsletter: true,
          whatsappButton: true
        }
      },
      // Enhanced error handling
      onError: (error) => {
        console.error('Site settings fetch error:', error)
        // Don't throw error, use fallback data instead
      },
      // Retry configuration
      errorRetryCount: 1,
      errorRetryInterval: 5000,
      // Keep previous data on error
      keepPreviousData: true,
    }
  )

  // Always return data (fallback if API fails)
  const safeData = data || {
    siteTitle: 'BS3DCrafts',
    tagline: 'Precision in Every Layer',
    contactEmail: 'bs3dcrafts.co@outlook.com',
    contactPhone: '+90 546 451 95 97',
    whatsappNumber: '905464519597',
    socialMedia: {
      instagram: 'https://instagram.com/bs3dcrafts',
      twitter: '',
      facebook: ''
    },
    features: {
      newsletter: true,
      whatsappButton: true
    }
  }

  return {
    data: safeData,
    isLoading,
    isError: !!error,
    error,
    mutate,
    refresh: () => mutate(),
  }
}

// Hook for preloading content (useful for prefetching)
export function usePreloadContent() {
  const { mutate } = useSWR('/api/content/homepage', null, { revalidateOnMount: false })

  const preloadHomepage = () => {
    mutate('/api/content/homepage')
  }

  const preloadNavigation = () => {
    mutate('/api/content/navigation')
  }

  const preloadSettings = () => {
    mutate('/api/content/settings')
  }

  const preloadPage = (slug: string) => {
    mutate(`/api/content/pages/${slug}`)
  }

  return {
    preloadHomepage,
    preloadNavigation,
    preloadSettings,
    preloadPage,
  }
}

// Hook for cache management
export function useCacheManager() {
  const { mutate } = useSWR('/api/content/homepage', null, { revalidateOnMount: false })

  const clearCache = (key?: string) => {
    if (key) {
      mutate(key, undefined)
    } else {
      // Clear specific content caches
      mutate('/api/content/homepage', undefined)
      mutate('/api/content/navigation', undefined)
      mutate('/api/content/settings', undefined)
    }
  }

  const refreshContent = () => {
    mutate('/api/content/homepage')
    mutate('/api/content/navigation')
    mutate('/api/content/settings')
  }

  const getCacheKeys = () => {
    // Return known cache keys since we can't access the cache directly
    return [
      '/api/content/homepage',
      '/api/content/navigation',
      '/api/content/settings'
    ]
  }

  const getCacheSize = () => {
    // Return estimated cache size
    return 3 // Known content endpoints
  }

  return {
    clearCache,
    refreshContent,
    getCacheKeys,
    getCacheSize,
  }
}