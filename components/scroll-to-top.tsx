'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse-glow group"
      aria-label="Yukarı çık"
    >
      <ArrowUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
    </button>
  )
}
