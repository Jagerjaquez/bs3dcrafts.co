import { prisma } from '@/lib/prisma'
import { QueryOptimizer } from '@/lib/performance'
import ProductsAdminTable from './products-admin-table'

export default async function AdminProductsPage() {
  // Use optimized query with select only needed fields
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: QueryOptimizer.getProductListSelect(),
  })

  const initial = JSON.parse(JSON.stringify(products))

  return <ProductsAdminTable initial={initial} />
}
