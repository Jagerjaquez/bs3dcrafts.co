export function ProductSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-700/50" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-700/50 rounded w-3/4" />
        <div className="h-4 bg-gray-700/50 rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-700/50 rounded w-1/3" />
          <div className="h-10 bg-gray-700/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
