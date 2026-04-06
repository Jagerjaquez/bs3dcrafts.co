import { prisma } from '@/lib/prisma'
import OrdersManager, { type OrderRow } from './orders-manager'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  })

  const initialOrders = JSON.parse(JSON.stringify(orders)) as OrderRow[]

  return <OrdersManager initialOrders={initialOrders} />
}
