import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    paid: 'bg-green-500/10 text-green-500',
    shipped: 'bg-blue-500/10 text-blue-500',
    completed: 'bg-purple-500/10 text-purple-500',
    cancelled: 'bg-red-500/10 text-red-500'
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Siparişler</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="glass border border-primary/20 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-lg text-white">{order.customerName}</p>
                <p className="text-sm text-gray-300">{order.email}</p>
                <p className="text-sm text-gray-300">{order.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="border-t border-primary/20 pt-4 mt-4">
              <p className="text-sm text-gray-400 mb-2">Ürünler:</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-300">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span className="font-semibold text-white">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-primary/20 pt-4 mt-4">
              <p className="text-sm text-gray-400">Adres:</p>
              <p className="text-sm text-gray-300">{order.address}</p>
            </div>

            <div className="text-xs text-gray-400 mt-4">
              Sipariş Tarihi: {formatDate(order.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
