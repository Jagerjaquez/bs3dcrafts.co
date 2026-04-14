'use client'

import { DynamicPageLoadingSkeleton } from '@/components/dynamic-page-loading-skeleton'

interface PageData {
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  updatedAt: string
}

interface DynamicPageContentProps {
  data: PageData | null
}

export function DynamicPageContent({ data }: DynamicPageContentProps) {
  if (!data) {
    return <DynamicPageLoadingSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            <span className="gradient-text">{data.title}</span>
          </h1>
          {data.metaDescription && (
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {data.metaDescription}
            </p>
          )}
        </div>

        {/* Page Content */}
        <div className="glass rounded-3xl p-8 md:p-12 animate-zoom-in">
          <article 
            className="prose prose-invert prose-lg max-w-none
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-6 [&_h1]:gradient-text
              [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-gray-300 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-gray-300 [&_ol]:mb-4
              [&_li]:mb-2
              [&_a]:text-primary [&_a]:hover:text-secondary [&_a]:transition-colors [&_a]:underline
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
              [&_code]:bg-gray-800 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-primary [&_code]:text-sm
              [&_pre]:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
              [&_img]:rounded-lg [&_img]:shadow-lg [&_img]:mb-4
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
              [&_th]:border [&_th]:border-gray-600 [&_th]:bg-gray-800 [&_th]:p-3 [&_th]:text-white [&_th]:font-semibold
              [&_td]:border [&_td]:border-gray-600 [&_td]:p-3 [&_td]:text-gray-300
              [&_hr]:border-gray-600 [&_hr]:my-8"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
          
          {/* Last Updated */}
          <div className="mt-12 pt-8 border-t border-gray-600">
            <p className="text-sm text-gray-400 text-center">
              Son güncelleme: {new Date(data.updatedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}