import { ContentSkeleton } from '@/components/content-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Loading skeleton */}
      <div className="flex-1 relative z-10">
        <ContentSkeleton />
      </div>
    </div>
  )
}