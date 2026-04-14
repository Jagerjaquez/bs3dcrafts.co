'use client'

/**
 * Monitoring Dashboard Component
 * Displays system health and error tracking information
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  responseTime: number
  services: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
}

interface AuditLogEntry {
  timestamp: string
  action: string
  userId: string
  success: boolean
  errorMessage?: string
  ipAddress?: string
}

export function MonitoringDashboard() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthData(data)
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs?limit=10')
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await Promise.all([fetchHealthData(), fetchAuditLogs()])
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'unhealthy':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      unhealthy: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR')
  }

  const formatResponseTime = (ms?: number) => {
    if (!ms) return 'N/A'
    return `${ms}ms`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistem İzleme</h2>
          <p className="text-gray-600">
            Son güncelleme: {formatTimestamp(lastRefresh.toISOString())}
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Overall Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(healthData.status)}
              Sistem Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthData.summary.healthy}
                </div>
                <div className="text-sm text-gray-600">Sağlıklı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {healthData.summary.degraded}
                </div>
                <div className="text-sm text-gray-600">Yavaş</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {healthData.summary.unhealthy}
                </div>
                <div className="text-sm text-gray-600">Sorunlu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatResponseTime(healthData.responseTime)}
                </div>
                <div className="text-sm text-gray-600">Yanıt Süresi</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>Servis Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthData.services.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium capitalize">
                        {service.service === 'database' ? 'Veritabanı' :
                         service.service === 'storage' ? 'Dosya Depolama' :
                         service.service === 'system' ? 'Sistem' :
                         service.service === 'stripe' ? 'Stripe' :
                         service.service === 'sentry' ? 'Hata İzleme' :
                         service.service}
                      </div>
                      {service.error && (
                        <div className="text-sm text-red-600">{service.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.responseTime && (
                      <span className="text-sm text-gray-600">
                        {formatResponseTime(service.responseTime)}
                      </span>
                    )}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-2">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      {log.errorMessage && (
                        <div className="text-sm text-red-600">{log.errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {formatTimestamp(log.timestamp)}
                    </div>
                    {log.ipAddress && (
                      <div className="text-xs text-gray-500">{log.ipAddress}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Henüz aktivite kaydı bulunmuyor
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      {healthData?.services.find(s => s.service === 'system')?.details && (
        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const systemDetails = healthData.services.find(s => s.service === 'system')?.details
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Bellek Kullanımı</div>
                    <div className="font-medium">
                      {systemDetails?.memory?.heapUsed}MB / {systemDetails?.memory?.heapTotal}MB
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Çalışma Süresi</div>
                    <div className="font-medium">
                      {Math.floor((systemDetails?.uptime || 0) / 3600)}h {Math.floor(((systemDetails?.uptime || 0) % 3600) / 60)}m
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Node.js</div>
                    <div className="font-medium">{systemDetails?.nodeVersion}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Platform</div>
                    <div className="font-medium">{systemDetails?.platform}</div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}