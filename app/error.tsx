'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="glass rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Bir Hata Oluştu
            </h1>
            <p className="text-gray-300">
              Sayfa yüklenirken bir sorun yaşandı. Lütfen tekrar deneyin.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
              <p className="text-red-400 text-sm font-mono">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-red-300 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1 border-primary/50 hover:bg-primary/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Sorun devam ederse lütfen bizimle iletişime geçin:</p>
            <p>
              <a 
                href="mailto:bs3dcrafts.co@outlook.com" 
                className="text-primary hover:underline"
              >
                bs3dcrafts.co@outlook.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}