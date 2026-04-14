'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console and external service
    console.error('Global Application Error:', error)
    
    // Send to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error)
    }
  }, [error])

  return (
    <html lang="tr" className="dark">
      <body className="bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-black/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Sistem Hatası
                </h1>
                <p className="text-gray-300">
                  Uygulama başlatılırken kritik bir hata oluştu. Lütfen sayfayı yenileyin.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
                  <p className="text-red-400 text-sm font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-red-300 text-xs mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-red-300 text-xs cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="text-red-400 text-xs mt-1 overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={reset}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tekrar Dene
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Sayfayı Yenile
                </button>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <p>Sorun devam ederse lütfen bizimle iletişime geçin:</p>
                <p>
                  <a 
                    href="mailto:bs3dcrafts.co@outlook.com" 
                    className="text-red-400 hover:underline"
                  >
                    bs3dcrafts.co@outlook.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}