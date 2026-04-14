'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigationContent } from '@/hooks/use-content'

export function CmsHeaderNav() {
  const { data, isLoading, isError, error } = useNavigationContent()
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Handle missing data gracefully
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-primary/20 rounded-lg animate-pulse" />
        <div className="h-8 w-24 bg-primary/20 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (isError) {
    console.warn('Failed to load navigation:', error)
    return null
  }

  if (!data?.header || data.header.length === 0) {
    return null
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      dropdownRefs.current.forEach((ref, itemId) => {
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdowns(prev => {
            const newSet = new Set(prev)
            newSet.delete(itemId)
            return newSet
          })
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  return (
    <>
      {data.header.map((item) => {
        const hasChildren = item.children && item.children.length > 0
        const isOpen = openDropdowns.has(item.id)

        if (hasChildren) {
          return (
            <div 
              key={item.id} 
              className="relative"
              ref={(el) => {
                if (el) {
                  dropdownRefs.current.set(item.id, el)
                } else {
                  dropdownRefs.current.delete(item.id)
                }
              }}
            >
              <button
                onClick={() => toggleDropdown(item.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white glass border border-primary/20 hover:border-primary/40 transition-all group"
              >
                <span>{item.label}</span>
                <ChevronDown className={`h-4 w-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 glass rounded-lg border border-primary/20 shadow-lg animate-slide-up z-[60] p-2">
                  {item.children?.map((child, index) => (
                    <div key={child.id}>
                      <Link 
                        href={child.url}
                        className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all"
                        onClick={() => toggleDropdown(item.id)}
                      >
                        {child.label}
                      </Link>
                      {index < (item.children?.length || 0) - 1 && (
                        <div className="border-t border-primary/10 my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <Link
            key={item.id}
            href={item.url}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white glass border border-primary/20 hover:border-primary/40 transition-colors"
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
