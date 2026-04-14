'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle, 
  Users, 
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardSkeleton } from '@/components/ui/enhanced-skeleton'

interface DashboardData {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  lowStockProducts: number
  userCount: number
  ordersByStatus: {
    pending: number
    paid: number
    shipped: number
    completed: number
    cancelled: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    email: string
    totalAmount: number
    status: string
    createdAt: string
  }>
  systemStatus: {
    database: boolean
    storage: boolean
    email: boolean
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    )
  }

  const stats = [
    {
      title: 'Toplam Ürün',
      value: data.totalProducts,
      icon: Package,
      color: 'text-purple-500',
      href: '/admin/products'
    },
    {
      title: 'Toplam Sipariş',
      value: data.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-500',
      href: '/admin/orders'
    },
    {
      title: 'Toplam Ciro',
      value: formatPrice(data.totalRevenue),
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Düşük Stok',
      value: data.lowStockProducts,
      icon: AlertCircle,
      color: 'text-orange-500',
      href: '/admin/products?filter=low-stock'
    },
    {
      title: 'Kullanıcı Sayısı',
      value: data.userCount,
      icon: Users,
      color: 'text-cyan-500'
    }
  ]

  const orderStatusStats = [
    { label: 'Beklemede', value: data.ordersByStatus.pending, icon: Clock, color: 'text-yellow-500' },
    { label: 'Ödendi', value: data.ordersByStatus.paid, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Kargoda', value: data.ordersByStatus.shipped, icon: Truck, color: 'text-blue-500' },
    { label: 'Tamamlandı', value: data.ordersByStatus.completed, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'İptal', value: data.ordersByStatus.cancelled, icon: XCircle, color: 'text-red-500' }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-400">
            Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
          </p>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
        <Link href="/admin/pages/new">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Sayfa
          </Button>
        </Link>
        <Link href="/admin/media">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Medya Yükle
          </Button>
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="glass border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            {stat.href && (
              <Link href={stat.href} className="text-sm text-primary hover:underline">
                Detayları Gör →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Sipariş Durumları</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {orderStatusStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Sistem Durumu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.systemStatus.database ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white">Veritabanı</span>
            <span className={`text-sm ${data.systemStatus.database ? 'text-green-400' : 'text-red-400'}`}>
              {data.systemStatus.database ? 'Çalışıyor' : 'Hata'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.systemStatus.storage ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white">Depolama</span>
            <span className={`text-sm ${data.systemStatus.storage ? 'text-green-400' : 'text-red-400'}`}>
              {data.systemStatus.storage ? 'Çalışıyor' : 'Hata'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${data.systemStatus.email ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white">E-posta</span>
            <span className={`text-sm ${data.systemStatus.email ? 'text-green-400' : 'text-red-400'}`}>
              {data.systemStatus.email ? 'Çalışıyor' : 'Hata'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass border border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Son Siparişler</h2>
          <Link href="/admin/orders" className="text-primary hover:underline">
            Tümünü Gör →
          </Link>
        </div>
        <div className="space-y-4">
          {data.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
              <div>
                <p className="font-semibold text-white">{order.customerName}</p>
                <p className="text-sm text-gray-300">{order.email}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">{formatPrice(order.totalAmount)}</p>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                  order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
