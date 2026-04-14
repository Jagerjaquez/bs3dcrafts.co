'use client'

import Link from 'next/link'
import { useNavigationContent } from '@/hooks/use-content'

interface CmsMobileNavProps {
  onItemClick: () => void
}

export function CmsMobileNav({ onItemClick }: CmsMobileNavProps) {
  const { data, isLoading, isError, error } = useNavigationContent()

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Sayfalar</p>
        <div className="pl-4 space-y-2">
          <div className="h-4 w-20 bg-primary/20 rounded animate-pulse" />
          <div className="h-4 w-24 bg-primary/20 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Handle error gracefully
  if (isError) {
    console.warn('Failed to load mobile navigation:', error)
    return null
  }

  // Handle missing data
  if (!data?.header || data.header.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-primary">Sayfalar</p>
      {data.header.map((item) => (
        <div key={item.id} className="space-y-1">
          <Link 
            href={item.url}
            className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
            onClick={onItemClick}
          >
            {item.label}
          </Link>
          {/* Support nested items in mobile */}
          {item.children && item.children.length > 0 && (
            <div className="pl-8 space-y-1">
              {item.children.map((child) => (
                <Link 
                  key={child.id}
                  href={child.url}
                  className="block text-xs text-gray-400 hover:text-primary transition-colors py-1"
                  onClick={onItemClick}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}