'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type NavItem = {
  id: string
  type: string
  label: string
  url: string
  order: number
}

export function CmsFooterNav() {
  const [items, setItems] = useState<NavItem[]>([])

  useEffect(() => {
    fetch('/api/content/navigation')
      .then((r) => r.json())
      .then((data: NavItem[]) => {
        const footer = Array.isArray(data)
          ? data
              .filter((n) => n.type === 'footer')
              .sort((a, b) => a.order - b.order)
          : []
        setItems(footer)
      })
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <div>
      <h4 className="font-semibold mb-4 text-white">Site</h4>
      <ul className="space-y-3 text-sm text-gray-400">
        {items.map((n) => (
          <li key={n.id}>
            <Link href={n.url} className="hover:text-primary transition-colors inline-flex items-center group">
              <span className="group-hover:translate-x-1 transition-transform">{n.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
