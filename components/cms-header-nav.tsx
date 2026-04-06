'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type NavItem = {
  id: string
  type: string
  label: string
  url: string
  order: number
  children?: NavItem[]
}

export function CmsHeaderNav() {
  const [items, setItems] = useState<NavItem[]>([])

  useEffect(() => {
    fetch('/api/content/navigation')
      .then((r) => r.json())
      .then((data: NavItem[]) => {
        const roots = Array.isArray(data)
          ? data.filter((n) => n.type === 'header').sort((a, b) => a.order - b.order)
          : []
        setItems(roots)
      })
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <>
      {items.map((n) => (
        <div key={n.id} className="flex items-center gap-1">
          <Link
            href={n.url}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white glass border border-primary/20 hover:border-primary/40 transition-colors"
          >
            {n.label}
          </Link>
          {(n.children || []).map((c) => (
            <Link
              key={c.id}
              href={c.url}
              className="px-2 py-1 rounded-md text-xs text-gray-300 hover:text-white"
            >
              {c.label}
            </Link>
          ))}
        </div>
      ))}
    </>
  )
}
