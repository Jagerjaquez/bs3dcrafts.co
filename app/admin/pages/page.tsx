'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableSkeleton } from '@/components/ui/enhanced-skeleton'
import { Plus, Search, Filter, Trash2, Edit, Eye } from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  status: string
  updatedAt: string
}

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [filteredPages, setFilteredPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')

  useEffect(() => {
    fetchPages()
  }, [])

  useEffect(() => {
    let filtered = pages

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter)
    }

    setFilteredPages(filtered)
  }, [pages, searchTerm, statusFilter])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async (id: string, title: string) => {
    if (!confirm(`"${title}" sayfasını silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf-token='))
            ?.split('=')[1] || ''
        }
      })

      if (response.ok) {
        setPages(pages.filter(page => page.id !== id))
      } else {
        alert('Sayfa silinirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
      alert('Sayfa silinirken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">CMS Sayfaları</h1>
          <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse" />
        </div>
        <div className="glass border border-primary/20 rounded-lg">
          <TableSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">CMS Sayfaları</h1>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sayfa
          </Button>
        </Link>
      </div>

      <p className="text-gray-400 text-sm">
        Yayınlanan sayfalar sitede <code className="text-primary">/sayfa/[slug]</code> adresinden görüntülenir.
      </p>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sayfa başlığı veya slug ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/20 border-primary/20 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
            className="px-3 py-2 rounded-lg bg-black/20 border border-primary/20 text-white text-sm"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400">
        {filteredPages.length} sayfa bulundu
        {searchTerm && ` "${searchTerm}" için`}
        {statusFilter !== 'all' && ` (${statusFilter === 'draft' ? 'Taslak' : 'Yayında'})`}
      </div>

      {/* Pages Table */}
      <div className="glass border border-primary/20 rounded-lg overflow-hidden">
        {filteredPages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Arama kriterlerinize uygun sayfa bulunamadı.'
              : 'Henüz sayfa oluşturulmamış.'
            }
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-primary/10 text-gray-300 text-sm">
              <tr>
                <th className="p-3">Başlık</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Durum</th>
                <th className="p-3">Güncelleme</th>
                <th className="p-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.id} className="border-t border-primary/20 hover:bg-primary/5">
                  <td className="p-3 text-white font-medium">{page.title}</td>
                  <td className="p-3 text-gray-400 font-mono text-sm">{page.slug}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === 'published' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {page.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 text-sm">
                    {new Date(page.updatedAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/pages/${page.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                      </Link>
                      {page.status === 'published' && (
                        <Link href={`/sayfa/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Görüntüle
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePage(page.id, page.title)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
