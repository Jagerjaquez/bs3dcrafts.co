'use client'

import Link from 'next/link'
import { useNavigationContent } from '@/hooks/use-content'

export function CmsFooterNav() {
  const { data, isLoading, isError, error } = useNavigationContent()

  // Handle loading state
  if (isLoading) {
    return (
      <div>
        <h4 className="font-semibold mb-4 text-white">Site</h4>
        <ul className="space-y-3 text-sm text-gray-400">
          <li><div className="h-4 w-20 bg-primary/20 rounded animate-pulse" /></li>
          <li><div className="h-4 w-24 bg-primary/20 rounded animate-pulse" /></li>
          <li><div className="h-4 w-16 bg-primary/20 rounded animate-pulse" /></li>
        </ul>
      </div>
    )
  }

  // Handle error gracefully
  if (isError) {
    console.warn('Failed to load footer navigation:', error)
    return (
      <div>
        <h4 className="font-semibold mb-4 text-white">Site</h4>
        <ul className="space-y-3 text-sm text-gray-400">
          <li>
            <span className="text-gray-500">Navigasyon yüklenemedi</span>
          </li>
        </ul>
      </div>
    )
  }

  // Handle missing data
  if (!data?.footer || data.footer.length === 0) {
    return null
  }

  return (
    <div>
      <h4 className="font-semibold mb-4 text-white">Site</h4>
      <ul className="space-y-3 text-sm text-gray-400">
        {data.footer.map((item) => (
          <li key={item.id}>
            <Link 
              href={item.url} 
              className="hover:text-primary transition-colors inline-flex items-center group"
            >
              <span className="group-hover:translate-x-1 transition-transform">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
