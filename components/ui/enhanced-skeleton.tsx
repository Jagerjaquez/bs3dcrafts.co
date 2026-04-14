/**
 * Enhanced skeleton components for better loading states
 * Implements Task 22.5: Add loading states and skeletons
 */

import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  count?: number
}

// Form skeleton for admin panels
export function FormSkeleton({ className, count = 5 }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

// Table skeleton for admin lists
export function TableSkeleton({ className, count = 5 }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-primary/20">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-primary/10">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

// Product grid skeleton
export function ProductGridSkeleton({ className, count = 8 }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard metrics skeleton
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Media library skeleton
export function MediaLibrarySkeleton({ className, count = 12 }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-2">
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Order detail skeleton
export function OrderDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Order header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="glass rounded-2xl p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Order items */}
      <div className="glass rounded-2xl p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border border-primary/10 rounded-lg">
              <Skeleton className="h-16 w-16 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Settings panel skeleton
export function SettingsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-primary/20">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Settings form */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section} className="glass rounded-2xl p-6">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, field) => (
                <div key={field} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// Navigation editor skeleton
export function NavigationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and footer tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Navigation items */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

// Generic loading spinner for form submissions
export function LoadingSpinner({ className, size = "default" }: { 
  className?: string
  size?: "sm" | "default" | "lg" 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("animate-spin rounded-full border-2 border-primary/20 border-t-primary", sizeClasses[size], className)} />
  )
}

// Button loading state
export function ButtonLoading({ children, isLoading, ...props }: {
  children: React.ReactNode
  isLoading: boolean
  [key: string]: any
}) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Yükleniyor...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}