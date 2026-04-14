export function HomepageLoadingSkeleton() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge skeleton */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20">
              <div className="h-4 w-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-600 rounded animate-pulse" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-4">
              <div className="h-16 bg-gray-600 rounded animate-pulse mx-auto max-w-2xl" />
              <div className="h-8 bg-gray-600 rounded animate-pulse mx-auto max-w-xl" />
            </div>
            
            {/* Button skeleton */}
            <div className="flex justify-center">
              <div className="h-16 w-64 bg-gray-600 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-8">
                <div className="w-16 h-16 bg-gray-600 rounded-2xl mb-6 animate-pulse" />
                <div className="h-8 bg-gray-600 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section Skeleton */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/20 mb-6">
              <div className="h-4 w-4 bg-gray-600 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-600 rounded animate-pulse" />
            </div>
            <div className="h-12 bg-gray-600 rounded mb-4 animate-pulse mx-auto max-w-lg" />
            <div className="h-6 bg-gray-600 rounded animate-pulse mx-auto max-w-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-600 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-600 rounded animate-pulse w-24" />
                    <div className="h-4 bg-gray-600 rounded animate-pulse w-16" />
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="h-5 w-5 bg-gray-600 rounded animate-pulse" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}