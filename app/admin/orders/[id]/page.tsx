import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Props = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })
  if (!order) notFound()

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Siparişler
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Sipariş detayı</h1>
      </div>

      <div className="glass border border-primary/20 rounded-lg p-6 space-y-4 text-gray-300">
        <p>
          <span className="text-gray-500">ID:</span> {order.id}
        </p>
        <p>
          <span className="text-gray-500">Müşteri:</span> {order.customerName}
        </p>
        <p>
          <span className="text-gray-500">E-posta:</span> {order.email}
        </p>
        <p>
          <span className="text-gray-500">Telefon:</span> {order.phone}
        </p>
        <p>
          <span className="text-gray-500">Durum:</span> {order.status}
        </p>
        {order.trackingNumber && (
          <p>
            <span className="text-gray-500">Takip:</span> {order.trackingNumber}
          </p>
        )}
        <p>
          <span className="text-gray-500">Toplam:</span>{' '}
          <span className="text-white font-semibold">{formatPrice(order.totalAmount)}</span>
        </p>
        <p>
          <span className="text-gray-500">Tarih:</span> {formatDate(order.createdAt)}
        </p>
        <div className="border-t border-primary/20 pt-4">
          <p className="text-white font-medium mb-2">Adres</p>
          <p>{order.address}</p>
        </div>
        <div className="border-t border-primary/20 pt-4">
          <p className="text-white font-medium mb-2">Kalemler</p>
          <ul className="space-y-2">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>
                  {i.product.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
