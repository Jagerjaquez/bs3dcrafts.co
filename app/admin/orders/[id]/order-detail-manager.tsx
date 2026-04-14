'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminJsonHeaders } from '@/lib/admin-client'
import { useToast } from '@/contexts/toast-context'

type OrderData = {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  totalAmount: number
  status: string
  trackingNumber: string | null
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    product: {
      id: string
      name: string
    }
  }>
}

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const
const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoya Verildi',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi'
}

interface OrderDetailManagerProps {
  order: OrderData
}

export default function OrderDetailManager({ order: initialOrder }: OrderDetailManagerProps) {
  const [order, setOrder] = useState(initialOrder)
  const [saving, setSaving] = useState(false)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const { showSuccess, showError } = useToast()

  // Listen for invoice generation events from parent component
  useEffect(() => {
    const handleGenerateInvoice = (event: CustomEvent) => {
      if (event.detail.orderId === order.id) {
        generateInvoice()
      }
    }

    window.addEventListener('generateInvoice', handleGenerateInvoice as EventListener)
    return () => {
      window.removeEventListener('generateInvoice', handleGenerateInvoice as EventListener)
    }
  }, [order.id])

  const updateOrder = (updates: Partial<OrderData>) => {
    setOrder(prev => ({ ...prev, ...updates }))
  }

  const saveOrder = async () => {
    // Validate tracking number for shipped status
    if (order.status === 'shipped' && !order.trackingNumber?.trim()) {
      showError('Doğrulama Hatası', 'Kargoya verilen siparişler için takip numarası gereklidir')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: adminJsonHeaders(),
        body: JSON.stringify({
          status: order.status,
          trackingNumber: order.trackingNumber ?? '',
        }),
      })
      
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showError('Güncelleme başarısız', (data as { error?: string }).error || 'Sipariş durumu güncellenemedi')
        return
      }
      
      updateOrder({
        status: data.status,
        trackingNumber: data.trackingNumber ?? null,
      })
      
      showSuccess('Sipariş güncellendi', 'Sipariş durumu başarıyla kaydedildi ve müşteriye bildirim gönderildi')
    } catch {
      showError('Bağlantı hatası', 'Sunucuya bağlanılamadı')
    } finally {
      setSaving(false)
    }
  }

  const generateInvoice = async () => {
    setGeneratingInvoice(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/invoice`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        showError('Fatura Hatası', 'Fatura oluşturulamadı')
        return
      }

      // Create download link
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fatura-${order.id.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showSuccess('Fatura İndirildi', 'Fatura başarıyla oluşturuldu ve indirildi')
    } catch {
      showError('Fatura Hatası', 'Fatura indirilemedi')
    } finally {
      setGeneratingInvoice(false)
    }
  }

  return (
    <div className="glass border border-primary/20 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Durum Güncelle</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-gray-300">
            Sipariş Durumu
          </Label>
          <Select
            value={order.status}
            onValueChange={(value) => updateOrder({ status: value })}
          >
            <SelectTrigger className="bg-black/30 border-primary/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trackingNumber" className="text-gray-300">
            Kargo Takip Numarası
            {order.status === 'shipped' && <span className="text-red-400 ml-1">*</span>}
          </Label>
          <Input
            id="trackingNumber"
            type="text"
            value={order.trackingNumber ?? ''}
            onChange={(e) => updateOrder({ trackingNumber: e.target.value })}
            placeholder={order.status === 'shipped' ? 'Gerekli' : 'Opsiyonel'}
            className="bg-black/30 border-primary/20 text-white"
            required={order.status === 'shipped'}
          />
          {order.status === 'shipped' && (
            <p className="text-xs text-gray-400">
              Kargoya verilen siparişler için takip numarası zorunludur
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={saveOrder}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/80"
          >
            {saving ? 'Kaydediliyor...' : 'Durumu Güncelle'}
          </Button>
          
          <Button
            onClick={generateInvoice}
            disabled={generatingInvoice}
            variant="outline"
            className="w-full"
          >
            {generatingInvoice ? 'Oluşturuluyor...' : 'Fatura Oluştur'}
          </Button>
        </div>
      </div>
    </div>
  )
}