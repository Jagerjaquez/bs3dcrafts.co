import * as Sentry from '@sentry/nextjs'

// ============================================================================
// Types
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorCategory = 
  | 'api' 
  | 'payment' 
  | 'auth' 
  | 'database' 
  | 'validation' 
  | 'security'
  | 'business'
  | 'test'

export interface ErrorContext {
  category: ErrorCategory
  severity: ErrorSeverity
  metadata?: Record<string, any>
  userId?: string
}

export interface CustomEvent {
  name: string
  category: ErrorCategory
  severity: ErrorSeverity
  metadata?: Record<string, any>
  userId?: string
}

// ============================================================================
// Error Tracking
// ============================================================================

export function trackError(error: Error, context: ErrorContext): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.error('[Monitoring] Error:', error, context)
    return
  }

  Sentry.withScope((scope) => {
    // Set severity
    scope.setLevel(mapSeverityToSentryLevel(context.severity))
    
    // Set category
    scope.setTag('category', context.category)
    
    // Set user context
    if (context.userId) {
      scope.setUser({ id: context.userId })
    }
    
    // Add metadata
    if (context.metadata) {
      scope.setContext('metadata', context.metadata)
    }
    
    // Capture exception
    Sentry.captureException(error)
  })
}

// ============================================================================
// Custom Events
// ============================================================================

export function trackEvent(event: CustomEvent): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('[Monitoring] Event:', event)
    return
  }

  Sentry.withScope((scope) => {
    scope.setLevel(mapSeverityToSentryLevel(event.severity))
    scope.setTag('category', event.category)
    
    if (event.userId) {
      scope.setUser({ id: event.userId })
    }
    
    Sentry.captureMessage(event.name, {
      contexts: {
        event: event.metadata || {},
      },
    })
  })
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export function startTransaction(name: string, op: string = 'http.server') {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return {
      setStatus: () => {},
      setTag: () => {},
      setData: () => {},
      finish: () => {},
    }
  }

  return Sentry.startSpan({ name, op }, (span) => span)
}

// ============================================================================
// User Context
// ============================================================================

export function setUserContext(user: {
  id: string
  email?: string
  username?: string
}): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

export function clearUserContext(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  Sentry.setUser(null)
}

// ============================================================================
// Breadcrumbs
// ============================================================================

export function addBreadcrumb(
  message: string,
  category: string = 'default',
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  })
}

// ============================================================================
// Business Metrics
// ============================================================================

export const BusinessMetrics = {
  orderCreated(orderId: string, amount: number): void {
    trackEvent({
      name: 'order_created',
      category: 'business',
      severity: 'low',
      metadata: { orderId, amount },
    })
  },

  orderCompleted(orderId: string, amount: number): void {
    trackEvent({
      name: 'order_completed',
      category: 'business',
      severity: 'low',
      metadata: { orderId, amount },
    })
  },

  productViewed(productId: string, productName: string): void {
    trackEvent({
      name: 'product_viewed',
      category: 'business',
      severity: 'low',
      metadata: { productId, productName },
    })
  },

  cartAbandoned(cartValue: number, itemCount: number): void {
    trackEvent({
      name: 'cart_abandoned',
      category: 'business',
      severity: 'low',
      metadata: { cartValue, itemCount },
    })
  },

  checkoutStarted(cartValue: number, itemCount: number): void {
    trackEvent({
      name: 'checkout_started',
      category: 'business',
      severity: 'low',
      metadata: { cartValue, itemCount },
    })
  },

  paymentFailed(orderId: string, amount: number, reason: string): void {
    trackEvent({
      name: 'payment_failed',
      category: 'payment',
      severity: 'high',
      metadata: { orderId, amount, reason },
    })
  },
}

// ============================================================================
// Security Events
// ============================================================================

export const SecurityEvents = {
  suspiciousActivity(description: string, metadata?: Record<string, any>): void {
    trackEvent({
      name: 'suspicious_activity',
      category: 'security',
      severity: 'high',
      metadata: { description, ...metadata },
    })
  },

  bruteForceAttempt(ipAddress: string, attempts: number): void {
    trackEvent({
      name: 'brute_force_attempt',
      category: 'security',
      severity: 'critical',
      metadata: { ipAddress, attempts },
    })
  },

  unauthorizedAccess(path: string, ipAddress: string): void {
    trackEvent({
      name: 'unauthorized_access',
      category: 'security',
      severity: 'high',
      metadata: { path, ipAddress },
    })
  },

  csrfViolation(ipAddress: string): void {
    trackEvent({
      name: 'csrf_violation',
      category: 'security',
      severity: 'critical',
      metadata: { ipAddress },
    })
  },
}

// ============================================================================
// Helpers
// ============================================================================

function mapSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
  const mapping: Record<ErrorSeverity, Sentry.SeverityLevel> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'fatal',
  }
  return mapping[severity]
}
