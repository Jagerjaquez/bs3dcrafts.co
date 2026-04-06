import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function AdminPagesListPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">CMS sayfaları</h1>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni sayfa
          </Button>
        </Link>
      </div>
      <p className="text-gray-400 text-sm">
        Yayınlanan sayfalar sitede <code className="text-primary">/sayfa/[slug]</code> adresinden görüntülenir.
      </p>
      <div className="glass border border-primary/20 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-primary/10 text-gray-300 text-sm">
            <tr>
              <th className="p-3">Başlık</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Durum</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t border-primary/20">
                <td className="p-3 text-white">{p.title}</td>
                <td className="p-3 text-gray-400">{p.slug}</td>
                <td className="p-3 text-gray-300">{p.status}</td>
                <td className="p-3">
                  <Link href={`/admin/pages/${p.id}`}>
                    <Button variant="outline" size="sm">
                      Düzenle
                    </Button>
                  </Link>
                  <Link href={`/sayfa/${p.slug}`} className="ml-2" target="_blank">
                    <Button variant="ghost" size="sm">
                      Görüntüle
                    </Button>
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
