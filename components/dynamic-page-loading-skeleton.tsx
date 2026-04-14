export function DynamicPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-600 rounded mb-4 animate-pulse mx-auto max-w-lg" />
          <div className="h-6 bg-gray-600 rounded animate-pulse mx-auto max-w-md" />
        </div>

        {/* Page Content Skeleton */}
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="space-y-6">
            {/* Title skeleton */}
            <div className="h-8 bg-gray-600 rounded animate-pulse max-w-2xl" />
            
            {/* Paragraph skeletons */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
            </div>
            
            {/* Another section */}
            <div className="h-6 bg-gray-600 rounded animate-pulse max-w-xl mt-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 bg-gray-600 rounded animate-pulse w-2/3" />
            </div>
            
            {/* List skeleton */}
            <div className="space-y-2 mt-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-gray-600 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-600 rounded animate-pulse flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-gray-600 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-600 rounded animate-pulse flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-gray-600 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
              </div>
            </div>
            
            {/* Final paragraph */}
            <div className="space-y-3 mt-8">
              <div className="h-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 bg-gray-600 rounded animate-pulse w-5/6" />
            </div>
          </div>
          
          {/* Last Updated Skeleton */}
          <div className="mt-12 pt-8 border-t border-gray-600">
            <div className="h-4 bg-gray-600 rounded animate-pulse mx-auto max-w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}