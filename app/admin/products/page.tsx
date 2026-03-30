import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      media: {
        where: { type: 'image' },
        take: 1
      }
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Ürünler</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      <div className="glass border border-primary/20 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left p-4 text-white">Ürün</th>
              <th className="text-left p-4 text-white">Kategori</th>
              <th className="text-left p-4 text-white">Fiyat</th>
              <th className="text-left p-4 text-white">Stok</th>
              <th className="text-left p-4 text-white">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-primary/20">
                <td className="p-4">
                  <div className="font-semibold text-white">{product.name}</div>
                  <div className="text-sm text-gray-400">{product.slug}</div>
                </td>
                <td className="p-4 text-gray-300">{product.category}</td>
                <td className="p-4 text-white">{formatPrice(product.price)}</td>
                <td className="p-4">
                  <span className={product.stock <= 5 ? 'text-orange-500' : 'text-white'}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm">Düzenle</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
