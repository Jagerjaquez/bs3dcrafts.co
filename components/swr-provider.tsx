'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

// Enhanced fetcher function for SWR with better error handling
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    try {
      ;(error as any).info = await response.json()
    } catch {
      ;(error as any).info = { message: 'Failed to parse error response' }
    }
    ;(error as any).status = response.status
    throw error
  }
  
  return response.json()
}

// Cache configuration for different content types with performance optimizations
const CACHE_CONFIG = {
  // Content endpoints - 5 minutes cache with optimized settings
  content: {
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 300000,  // 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    // Performance optimizations
    revalidateIfStale: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    errorRetryCount: 2,
    errorRetryInterval: 3000,
    loadingTimeout: 8000
  },
  // Settings endpoints - 10 minutes cache (changes less frequently)
  settings: {
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 600000,  // 10 minutes
    revalidateOnFocus: false, // Don't revalidate on focus for settings
    revalidateOnReconnect: true,
    // Performance optimizations
    revalidateIfStale: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    errorRetryCount: 1,
    errorRetryInterval: 5000,
    loadingTimeout: 10000
  },
  // Navigation endpoints - 5 minutes cache
  navigation: {
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 300000,  // 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    // Performance optimizations
    revalidateIfStale: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    errorRetryCount: 2,
    errorRetryInterval: 3000,
    loadingTimeout: 8000
  }
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Default cache for 5 minutes (300 seconds) with performance optimizations
        dedupingInterval: 300000,
        // Revalidate on focus for better UX
        revalidateOnFocus: true,
        // Revalidate on reconnect
        revalidateOnReconnect: true,
        // Retry configuration with exponential backoff
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Use Map for better performance
        provider: () => new Map(),
        // Global error handler with better logging
        onError: (error, key) => {
          console.error('SWR Error:', {
            key,
            message: error.message,
            status: error.status,
            info: error.info,
            timestamp: new Date().toISOString()
          })
        },
        // Success handler for debugging
        onSuccess: (data, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('SWR Success:', { key, dataKeys: Object.keys(data || {}) })
          }
        },
        // Default refresh interval (5 minutes)
        refreshInterval: 300000,
        // Performance optimizations
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        // Handle stale data gracefully
        revalidateIfStale: true,
        // Fallback data handling
        fallbackData: undefined,
        // Loading timeout (reduced for better UX)
        loadingTimeout: 8000, // 8 seconds
        // Error retry with exponential backoff
        shouldRetryOnError: (error) => {
          // Don't retry on 4xx errors (client errors)
          if (error.status >= 400 && error.status < 500) {
            return false
          }
          return true
        },
        // Keep previous data while revalidating
        keepPreviousData: true,
        // Compare function for better caching
        compare: (a, b) => {
          // Simple deep comparison for small objects
          return JSON.stringify(a) === JSON.stringify(b)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}

// Export cache configuration for use in custom hooks
export { CACHE_CONFIG }