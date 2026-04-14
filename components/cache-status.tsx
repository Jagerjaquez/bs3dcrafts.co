'use client'

import { useState, useEffect } from 'react'
import { useCacheManager } from '@/hooks/use-content'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trash2, Database, Clock } from 'lucide-react'

interface CacheStatusProps {
  showInProduction?: boolean
}

export function CacheStatus({ showInProduction = false }: CacheStatusProps) {
  const { clearCache, refreshContent, getCacheKeys, getCacheSize } = useCacheManager()
  const [cacheKeys, setCacheKeys] = useState<string[]>([])
  const [cacheSize, setCacheSize] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Only show in development unless explicitly enabled for production
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction

  useEffect(() => {
    if (!shouldShow) return

    const updateCacheInfo = () => {
      setCacheKeys(getCacheKeys())
      setCacheSize(getCacheSize())
      setLastUpdate(new Date())
    }

    // Update immediately
    updateCacheInfo()

    // Update every 5 seconds
    const interval = setInterval(updateCacheInfo, 5000)

    return () => clearInterval(interval)
  }, [shouldShow, getCacheKeys, getCacheSize])

  if (!shouldShow) {
    return null
  }

  const handleClearCache = () => {
    clearCache()
    setCacheKeys([])
    setCacheSize(0)
    setLastUpdate(new Date())
  }

  const handleRefreshContent = () => {
    refreshContent()
    setLastUpdate(new Date())
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 text-white text-sm max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-4 w-4 text-primary" />
        <span className="font-semibold">SWR Cache Status</span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Cache Size:</span>
          <span className="text-primary font-mono">{cacheSize}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Active Keys:</span>
          <span className="text-secondary font-mono">{cacheKeys.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Last Update:</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs font-mono">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {cacheKeys.length > 0 && (
        <div className="mb-3">
          <div className="text-gray-400 text-xs mb-1">Cached Endpoints:</div>
          <div className="max-h-20 overflow-y-auto space-y-1">
            {cacheKeys.map((key) => (
              <div key={key} className="text-xs font-mono text-gray-300 truncate">
                {key}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefreshContent}
          className="flex-1 h-8 text-xs border-primary/30 hover:bg-primary/10"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleClearCache}
          className="flex-1 h-8 text-xs border-destructive/30 hover:bg-destructive/10 text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  )
}