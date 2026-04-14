# Client-Side Caching Implementation

This document describes the comprehensive client-side caching system implemented using SWR for the BS3DCrafts CMS.

## Overview

The caching system provides:
- **5-minute cache** for content endpoints
- **10-minute cache** for settings (changes less frequently)
- **Automatic revalidation** on focus and reconnect
- **Graceful error handling** with fallback data
- **Cache invalidation** utilities for admin operations
- **Performance monitoring** tools for development

## Architecture

### SWR Provider Configuration

The `SWRProvider` component (`components/swr-provider.tsx`) provides global configuration:

```typescript
// Enhanced configuration with different cache strategies
const CACHE_CONFIG = {
  content: {
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 300000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  },
  settings: {
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 600000,
    revalidateOnFocus: false, // Less frequent updates
    revalidateOnReconnect: true,
  },
  navigation: {
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 300000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  }
}
```

### Custom Hooks

#### Content Hooks (`hooks/use-content.ts`)

1. **useHomepageContent()** - Homepage sections with fallback data
2. **useNavigationContent()** - Header/footer navigation
3. **usePageContent(slug)** - Dynamic page content by slug
4. **useSiteSettings()** - Site-wide settings
5. **usePreloadContent()** - Prefetching utilities
6. **useCacheManager()** - Cache management operations

#### Example Usage

```typescript
import { useHomepageContent } from '@/hooks/use-content'

function HomepageComponent() {
  const { data, isLoading, isError, refresh } = useHomepageContent()
  
  if (isLoading) return <LoadingSkeleton />
  if (isError) {
    // Graceful fallback - hook provides fallback data automatically
    console.error('Failed to load homepage content')
  }
  
  return <div>{data.hero.title}</div>
}
```

## Cache Invalidation

### Automatic Invalidation

Cache is automatically invalidated when:
- Admin saves content (via `invalidateHomepageCache()`)
- Navigation is updated (via `invalidateNavigationCache()`)
- Settings are changed (via `invalidateSettingsCache()`)

### Manual Invalidation

```typescript
import { useCacheInvalidation } from '@/lib/cache-invalidation'

function AdminComponent() {
  const { invalidateHomepage, invalidateAllContent } = useCacheInvalidation()
  
  const handleSave = async () => {
    await saveContent()
    await invalidateHomepage() // Refresh frontend cache
  }
}
```

### Available Invalidation Functions

- `invalidateHomepageCache()` - Homepage content
- `invalidateNavigationCache()` - Navigation menus
- `invalidateSettingsCache()` - Site settings
- `invalidatePageCache(slug)` - Specific page
- `invalidateAllContentCache()` - All content caches
- `invalidateAdminCache()` - Admin panel caches
- `clearAllCache()` - Nuclear option (use with caution)

## Error Handling

### Graceful Degradation

The system handles errors gracefully:

1. **Network Errors**: Shows loading state, retries automatically
2. **API Errors**: Falls back to cached data or default values
3. **Stale Data**: Continues showing stale data while revalidating

### Fallback Data

Critical components have fallback data:

```typescript
// Homepage always has fallback content
const fallbackData = {
  hero: {
    title: 'Her Katmanda Mükemmellik',
    subtitle: '3D baskı teknolojisi ile üretilen premium kalite ürünler.',
    // ...
  }
}
```

## Performance Optimizations

### Deduplication

SWR automatically deduplicates requests:
- Multiple components requesting same data = single API call
- 5-minute deduplication window prevents unnecessary requests

### Background Revalidation

Data is revalidated in the background:
- User sees cached data immediately
- Fresh data loads silently in background
- UI updates when new data arrives

### Conditional Fetching

```typescript
// Only fetch when slug is available
const { data } = usePageContent(slug ? slug : null)
```

### Preloading

```typescript
import { usePreloadContent } from '@/hooks/use-content'

function NavigationComponent() {
  const { preloadHomepage } = usePreloadContent()
  
  return (
    <Link 
      href="/" 
      onMouseEnter={() => preloadHomepage()} // Prefetch on hover
    >
      Home
    </Link>
  )
}
```

## Development Tools

### Cache Status Monitor

The `CacheStatus` component shows real-time cache information in development:

- Cache size and active keys
- Last update timestamp
- Manual refresh/clear buttons

```typescript
// Automatically included in development
<CacheStatus />
```

### Debug Information

Enhanced error logging in development:

```typescript
// SWR configuration includes detailed logging
onError: (error, key) => {
  console.error('SWR Error:', {
    key,
    message: error.message,
    status: error.status,
    timestamp: new Date().toISOString()
  })
}
```

## Migration from Server-Side Fetching

### Before (Server-Side)

```typescript
// app/page.tsx
export default async function HomePage() {
  const response = await fetch('/api/content/homepage', {
    next: { revalidate: 300 }
  })
  const data = await response.json()
  
  return <HomepageContent data={data} />
}
```

### After (Client-Side with SWR)

```typescript
// app/page.tsx
export default function HomePage() {
  return <HomepageContent /> // Data fetching handled inside component
}

// components/homepage-content.tsx
export function HomepageContent() {
  const { data, isLoading } = useHomepageContent()
  
  if (isLoading) return <LoadingSkeleton />
  return <div>{data.hero.title}</div>
}
```

## Best Practices

### 1. Use Appropriate Cache Duration

- **Content**: 5 minutes (changes frequently)
- **Settings**: 10 minutes (changes rarely)
- **Navigation**: 5 minutes (moderate changes)

### 2. Handle Loading States

Always provide loading skeletons:

```typescript
if (isLoading) return <HomepageLoadingSkeleton />
```

### 3. Graceful Error Handling

Don't break the UI on errors:

```typescript
if (isError) {
  console.error('Failed to load content')
  // Continue with fallback data
}
```

### 4. Invalidate After Updates

Always invalidate cache after admin operations:

```typescript
await saveContent()
await invalidateHomepageCache() // Critical!
```

### 5. Use Conditional Fetching

Prevent unnecessary requests:

```typescript
const { data } = useSWR(
  shouldFetch ? '/api/data' : null,
  fetcher
)
```

## Performance Metrics

### Cache Hit Rates

Monitor cache effectiveness:
- **Homepage**: ~90% cache hit rate expected
- **Navigation**: ~95% cache hit rate expected
- **Settings**: ~98% cache hit rate expected

### Load Times

Expected improvements:
- **Initial Load**: Same as before (first request)
- **Subsequent Loads**: ~80% faster (cached data)
- **Navigation**: ~90% faster (prefetched data)

## Troubleshooting

### Common Issues

1. **Stale Data**: Check cache invalidation after updates
2. **Loading Forever**: Check network connectivity and API endpoints
3. **Memory Usage**: Monitor cache size in development tools

### Debug Commands

```typescript
// Get cache statistics
const stats = getCacheStats()
console.log('Cache size:', stats.size)
console.log('Cache keys:', stats.keys)

// Clear specific cache
await invalidateHomepageCache()

// Nuclear option
await clearAllCache()
```

## Future Enhancements

### Planned Improvements

1. **Offline Support**: Cache data for offline viewing
2. **Background Sync**: Sync changes when connection restored
3. **Optimistic Updates**: Update UI before API confirmation
4. **Cache Persistence**: Persist cache across browser sessions
5. **Smart Prefetching**: ML-based content prefetching

### Performance Monitoring

Consider adding:
- Cache hit/miss metrics
- Load time tracking
- Error rate monitoring
- User experience metrics

## Conclusion

The client-side caching system provides:
- **Better Performance**: Faster subsequent loads
- **Better UX**: Immediate data display with background updates
- **Reliability**: Graceful error handling and fallbacks
- **Developer Experience**: Easy cache management and debugging tools

The system is designed to be maintainable, performant, and user-friendly while providing the flexibility needed for a dynamic CMS.