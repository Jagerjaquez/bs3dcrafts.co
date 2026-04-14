'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'
import { Plus, Trash2, GripVertical, Save, ChevronRight, ChevronDown } from 'lucide-react'

interface NavigationItem {
  id: string
  type: 'header' | 'footer'
  label: string
  url: string
  parentId?: string
  order: number
  children?: NavigationItem[]
}

interface NavigationData {
  header: NavigationItem[]
  footer: NavigationItem[]
}

export default function NavigationEditor() {
  const [navigation, setNavigation] = useState<NavigationData>({
    header: [],
    footer: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { showSuccess, showError } = useToast()

  const loadNavigation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/navigation', { credentials: 'include' })
      if (!res.ok) return
      
      const items: NavigationItem[] = await res.json()
      
      const headerItems = items.filter(item => item.type === 'header')
      const footerItems = items.filter(item => item.type === 'footer')
      
      setNavigation({
        header: headerItems,
        footer: footerItems
      })
    } catch (error) {
      showError('Yükleme hatası', 'Navigasyon yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNavigation()
  }, [])

  const saveNavigation = async () => {
    setSaving(true)
    try {
      // Delete all existing navigation items
      const existingItems = [...navigation.header, ...navigation.footer]
      for (const item of existingItems) {
        if (item.id && !item.id.startsWith('temp-')) {
          await fetch(`/api/admin/navigation/${item.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: adminJsonHeaders()
          })
        }
      }
      
      // Create all items fresh
      const allItems = [
        ...navigation.header.map(item => ({ ...item, type: 'header' as const })),
        ...navigation.footer.map(item => ({ ...item, type: 'footer' as const }))
      ]
      
      // First create parent items
      const parentItems = allItems.filter(item => !item.parentId)
      const createdParents: Record<string, string> = {}
      
      for (const item of parentItems) {
        const res = await fetch('/api/admin/navigation', {
          method: 'POST',
          credentials: 'include',
          headers: adminJsonHeaders(),
          body: JSON.stringify({
            type: item.type,
            label: item.label,
            url: item.url,
            order: item.order
          })
        })
        
        if (res.ok) {
          const created = await res.json()
          createdParents[item.id] = created.id
        }
      }
      
      // Then create child items
      const childItems = allItems.filter(item => item.parentId)
      for (const item of childItems) {
        const parentId = createdParents[item.parentId!]
        if (parentId) {
          await fetch('/api/admin/navigation', {
            method: 'POST',
            credentials: 'include',
            headers: adminJsonHeaders(),
            body: JSON.stringify({
              type: item.type,
              label: item.label,
              url: item.url,
              parentId,
              order: item.order
            })
          })
        }
      }
      
      showSuccess('Başarılı', 'Navigasyon kaydedildi')
      loadNavigation() // Reload to get fresh IDs
    } catch (error) {
      showError('Hata', 'Kaydetme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const addNavigationItem = (type: 'header' | 'footer', parentId?: string) => {
    const newItem: NavigationItem = {
      id: `temp-${Date.now()}`,
      type,
      label: '',
      url: '',
      parentId,
      order: 0,
      children: []
    }
    
    setNavigation(prev => {
      const items = prev[type]
      
      if (parentId) {
        // Add as child
        const updateItems = (items: NavigationItem[]): NavigationItem[] => {
          return items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                children: [...(item.children || []), newItem]
              }
            } else if (item.children) {
              return {
                ...item,
                children: updateItems(item.children)
              }
            }
            return item
          })
        }
        
        return {
          ...prev,
          [type]: updateItems(items)
        }
      } else {
        // Add as parent
        newItem.order = items.length
        return {
          ...prev,
          [type]: [...items, newItem]
        }
      }
    })
  }

  const removeNavigationItem = (type: 'header' | 'footer', itemId: string) => {
    setNavigation(prev => {
      const removeFromItems = (items: NavigationItem[]): NavigationItem[] => {
        return items.filter(item => {
          if (item.id === itemId) {
            return false
          }
          if (item.children) {
            item.children = removeFromItems(item.children)
          }
          return true
        })
      }
      
      return {
        ...prev,
        [type]: removeFromItems(prev[type])
      }
    })
  }

  const updateNavigationItem = (
    type: 'header' | 'footer', 
    itemId: string, 
    field: 'label' | 'url', 
    value: string
  ) => {
    setNavigation(prev => {
      const updateItems = (items: NavigationItem[]): NavigationItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, [field]: value }
          } else if (item.children) {
            return {
              ...item,
              children: updateItems(item.children)
            }
          }
          return item
        })
      }
      
      return {
        ...prev,
        [type]: updateItems(prev[type])
      }
    })
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const renderNavigationItem = (
    item: NavigationItem, 
    type: 'header' | 'footer', 
    index: number, 
    isChild = false
  ) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    
    return (
      <div key={item.id} className={`${isChild ? 'ml-8' : ''}`}>
        <div className="glass border border-primary/10 rounded-lg p-4 mb-2">
          <div className="flex items-center gap-4">
            {!isChild && (
              <div>
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
            )}
            
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item.id)}
                className="p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Etiket</label>
                <Input
                  value={item.label}
                  onChange={(e) => updateNavigationItem(type, item.id, 'label', e.target.value)}
                  className="bg-black/20 border-primary/20 text-white"
                  placeholder="Menü etiketi"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-1 block">URL</label>
                <Input
                  value={item.url}
                  onChange={(e) => updateNavigationItem(type, item.id, 'url', e.target.value)}
                  className="bg-black/20 border-primary/20 text-white"
                  placeholder="/sayfa-url"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isChild && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNavigationItem(type, item.id)}
                  title="Alt menü ekle"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeNavigationItem(type, item.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-2 space-y-2">
            {item.children!.map((child, childIndex) => 
              renderNavigationItem(child, type, childIndex, true)
            )}
          </div>
        )}
      </div>
    )
  }

  const renderNavigationSection = (type: 'header' | 'footer', title: string) => {
    const items = navigation[type]
    
    return (
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{title}</CardTitle>
            <Button onClick={() => addNavigationItem(type)} size="sm">
              <Plus className="h-4 w-4" />
              Öğe Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {items.map((item, index) => 
              renderNavigationItem(item, type, index)
            )}
          </div>
          
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Henüz {type === 'header' ? 'üst menü' : 'alt menü'} öğesi yok
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="text-white">Yükleniyor...</div>
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Navigasyon Yönetimi</h1>
        <Button onClick={saveNavigation} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <div className="text-gray-400 text-sm space-y-2">
        <p>• Üst menü öğelerini sürükleyerek yeniden sıralayabilirsiniz</p>
        <p>• Alt menü eklemek için ana öğenin yanındaki + butonunu kullanın</p>
        <p>• Maksimum 2 seviye desteklenir (ana menü → alt menü)</p>
      </div>

      <div className="space-y-8">
        {renderNavigationSection('header', 'Üst Menü (Header)')}
        {renderNavigationSection('footer', 'Alt Menü (Footer)')}
      </div>
    </div>
  )
}