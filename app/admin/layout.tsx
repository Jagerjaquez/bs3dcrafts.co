'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  Settings,
  Navigation,
  FileText,
  Image as ImageIcon,
  Home,
  Database,
} from 'lucide-react'
import AdminAuthWrapper from '@/components/admin-auth-wrapper'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen flex">
        <aside className="w-64 border-r border-primary/20 glass flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          </div>
          <nav className="space-y-1 px-3 flex-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <Package className="h-5 w-5" />
              Ürünler
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <ShoppingBag className="h-5 w-5" />
              Siparişler
            </Link>
            <Link
              href="/admin/content"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <Home className="h-5 w-5" />
              Ana sayfa metinleri
            </Link>
            <Link
              href="/admin/pages"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <FileText className="h-5 w-5" />
              Sayfalar
            </Link>
            <Link
              href="/admin/navigation"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <Navigation className="h-5 w-5" />
              Navigasyon
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <ImageIcon className="h-5 w-5" />
              Medya
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <Settings className="h-5 w-5" />
              Ayarlar
            </Link>
            <Link
              href="/admin/backup"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-white"
            >
              <Database className="h-5 w-5" />
              Yedekleme
            </Link>
          </nav>
          <div className="p-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <LogOut className="h-5 w-5" />
              Çıkış Yap
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
  )
}
