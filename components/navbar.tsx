'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Home, ChevronDown, Search, User } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Button } from './ui/button'
import { useState, useEffect, useRef } from 'react'
import { CartDrawer } from './cart-drawer'
import { SearchModal } from './search-modal'
import { useAuth } from '@/hooks/useAuth'
import { CmsHeaderNav } from '@/components/cms-header-nav'

export function Navbar() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen)
  const openDrawer = useCartStore((state) => state.openDrawer)
  const closeDrawer = useCartStore((state) => state.closeDrawer)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const { user, logout } = useAuth()
  
  const productsRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setProductsOpen(false)
      }
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setAboutOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="sticky top-0 z-50 glass border-b border-primary/10 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight group">
          <span className="text-white gradient-text group-hover:opacity-80 transition-opacity">BS3DCRAFTS</span>
          <span className="text-white">.CO</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* Ana Sayfa - Box Style */}
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group">
            <Home className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-white">Ana Sayfa</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap max-w-md lg:max-w-xl overflow-x-auto">
            <CmsHeaderNav />
          </div>

          {/* Ürünler Dropdown */}
          <div className="relative" ref={productsRef}>
            <button
              onClick={() => {
                setProductsOpen(!productsOpen)
                setAboutOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group"
            >
              <span className="text-sm font-medium text-white">Ürünler</span>
              <ChevronDown className={`h-4 w-4 text-white transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {productsOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 glass rounded-lg border border-primary/20 shadow-lg animate-slide-up z-[60] p-2">
                <Link 
                  href="/products" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                  onClick={() => setProductsOpen(false)}
                >
                  Tüm Ürünler
                </Link>
                <div className="border-t border-primary/10 my-2" />
                <Link 
                  href="/products?category=dekorasyon" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                  onClick={() => setProductsOpen(false)}
                >
                  Dekorasyon
                </Link>
                <Link 
                  href="/products?category=aksesuar" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                  onClick={() => setProductsOpen(false)}
                >
                  Aksesuar
                </Link>
                <Link 
                  href="/products?category=oyuncak" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                  onClick={() => setProductsOpen(false)}
                >
                  Oyuncak
                </Link>
                <Link 
                  href="/products?category=ev" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all"
                  onClick={() => setProductsOpen(false)}
                >
                  Ev & Yaşam
                </Link>
              </div>
            )}
          </div>

          {/* Hakkımızda Dropdown */}
          <div className="relative" ref={aboutRef}>
            <button
              onClick={() => {
                setAboutOpen(!aboutOpen)
                setProductsOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group"
            >
              <span className="text-sm font-medium text-white">Hakkımızda</span>
              <ChevronDown className={`h-4 w-4 text-white transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {aboutOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 glass rounded-lg border border-primary/20 shadow-lg animate-slide-up z-[60] p-2">
                <Link 
                  href="/about/vizyon" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                  onClick={() => setAboutOpen(false)}
                >
                  Vizyonumuz
                </Link>
                <Link 
                  href="/about/misyon" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                  onClick={() => setAboutOpen(false)}
                >
                  Misyonumuz
                </Link>
                <Link 
                  href="/about/kurulus" 
                  className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all"
                  onClick={() => setAboutOpen(false)}
                >
                  Kuruluş
                </Link>
              </div>
            )}
          </div>

          {/* İletişim */}
          <Link href="/contact" className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group">
            <span className="text-sm font-medium text-white">İletişim</span>
          </Link>
        </div>

        {/* Right Side - Search, User & Cart */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group"
          >
            <Search className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-white hidden lg:inline">Ara</span>
          </button>

          {/* User Menu */}
          {user ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group"
              >
                <User className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white hidden lg:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className={`h-4 w-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 glass rounded-lg border border-primary/20 shadow-lg animate-slide-up z-[60] p-2">
                  <Link 
                    href="/account" 
                    className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Hesabım
                  </Link>
                  <Link 
                    href="/account/orders" 
                    className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Siparişlerim
                  </Link>
                  <Link 
                    href="/account/addresses" 
                    className="flex items-center px-4 py-3 text-sm text-white font-medium rounded-lg glass border border-primary/20 hover:border-primary/40 hover-glow transition-all mb-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Adreslerim
                  </Link>
                  <div className="border-t border-primary/10 my-2" />
                  <button 
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-400 font-medium rounded-lg glass border border-primary/20 hover:border-red-400/40 hover-glow transition-all"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group"
              >
                <User className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white">Giriş</span>
              </Link>
              <Link 
                href="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary border border-primary/50 hover:border-primary/70 hover-glow transition-all group"
              >
                <span className="text-sm font-medium text-white">Kayıt Ol</span>
              </Link>
            </div>
          )}

          {/* Cart Button */}
          <button 
            onClick={openDrawer}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 hover-glow transition-all group"
          >
            <ShoppingCart className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-white hidden sm:inline">Sepetim</span>
            {totalItems > 0 && (
              <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow font-semibold">
                {totalItems}
              </span>
            )}
          </button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-primary/10 animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* User Section */}
            {user ? (
              <div className="space-y-2 pb-4 border-b border-primary/10">
                <p className="text-sm font-semibold text-primary">Hoş geldiniz, {user.name.split(' ')[0]}</p>
                <Link 
                  href="/account" 
                  className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hesabım
                </Link>
                <Link 
                  href="/account/orders" 
                  className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Siparişlerim
                </Link>
                <button 
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="block pl-4 text-sm text-red-400 hover:text-red-300 transition-colors py-2 w-full text-left"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pb-4 border-b border-primary/10">
                <Link 
                  href="/login"
                  className="flex-1 text-center px-4 py-2 rounded-lg glass border border-primary/30 text-sm font-medium text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş
                </Link>
                <Link 
                  href="/register"
                  className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary border border-primary/50 text-sm font-medium text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
            
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">Ürünler</p>
              <Link 
                href="/products" 
                className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Tüm Ürünler
              </Link>
              <Link 
                href="/products?category=dekorasyon" 
                className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dekorasyon
              </Link>
              <Link 
                href="/products?category=aksesuar" 
                className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Aksesuar
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">Hakkımızda</p>
              <Link 
                href="/about/vizyon" 
                className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Vizyonumuz
              </Link>
              <Link 
                href="/about/misyon" 
                className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Misyonumuz
              </Link>
              <Link 
                href="/about/kurulus" 
                className="block pl-4 text-sm text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Kuruluş
              </Link>
            </div>

            <Link 
              href="/contact" 
              className="block text-sm font-medium text-white hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              İletişim
            </Link>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  )
}
