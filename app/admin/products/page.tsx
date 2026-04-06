import { prisma } from '@/lib/prisma'
import ProductsAdminTable from './products-admin-table'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      media: {
        where: { type: 'image' },
        take: 1,
        select: { url: true },
      },
    },
  })

  const initial = JSON.parse(JSON.stringify(products))

  return <ProductsAdminTable initial={initial} />
}
