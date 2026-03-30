import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const [totalOrders, totalRevenue, lowStockProducts, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: 'paid' },
      _sum: { totalAmount: true }
    }),
    prisma.product.count({
      where: { stock: { lte: 5 } }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
  ])

  const stats = [
    {
      title: 'Toplam Sipariş',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-500'
    },
    {
      title: 'Toplam Ciro',
      value: formatPrice(totalRevenue._sum.totalAmount || 0),
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Düşük Stok',
      value: lowStockProducts,
      icon: AlertCircle,
      color: 'text-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="glass border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Son Siparişler</h2>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
              <div>
                <p className="font-semibold text-white">{order.customerName}</p>
                <p className="text-sm text-gray-300">{order.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">{formatPrice(order.totalAmount)}</p>
                <p className="text-sm text-gray-400">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
