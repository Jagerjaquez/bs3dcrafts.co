/**
 * Enhanced monitoring and error tracking for CMS
 * Integrates with existing Sentry setup for comprehensive error tracking
 */

import * as Sentry from '@sentry/nextjs'

export interface ErrorContext {
  userId?: string
  adminId?: string
  action?: string
  resource?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
  additionalData?: Record<string, any>
}

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'csrf_violation' | 'unauthorized_access' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
}

/**
 * Log API errors with context
 */
export function logAPIError(
  error: Error,
  context: ErrorContext = {}
): void {
  console.error('API Error:', error.message, context)
  
  Sentry.withScope((scope) => {
    // Set user context
    if (context.adminId) {
      scope.setUser({ id: context.adminId, role: 'admin' })
    } else if (context.userId) {
      scope.setUser({ id: context.userId, role: 'user' })
    }
    
    // Set tags for filtering
    if (context.action) scope.setTag('action', context.action)
    if (context.resource) scope.setTag('resource', context.resource)
    if (context.ipAddress) scope.setTag('ip_address', context.ipAddress)
    
    // Set context data
    scope.setContext('api_context', {
      action: context.action,
      resource: context.resource,
      resourceId: context.resourceId,
      requestId: context.requestId,
      ...context.additionalData
    })
    
    // Set level based on error type
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      scope.setLevel('warning')
    } else if (error.message.includes('Rate limit')) {
      scope.setLevel('info')
    } else {
      scope.setLevel('error')
    }
    
    Sentry.captureException(error)
  })
}

/**
 * Log authentication failures
 */
export function logAuthenticationFailure(
  reason: string,
  context: {
    ipAddress?: string
    userAgent?: string
    attemptedUsername?: string
    failureCount?: number
  } = {}
): void {
  console.warn('Authentication failure:', reason, context)
  
  Sentry.withScope((scope) => {
    scope.setTag('security_event', 'auth_failure')
    scope.setTag('failure_reason', reason)
    if (context.ipAddress) scope.setTag('ip_address', context.ipAddress)
    
    scope.setContext('auth_failure', {
      reason,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      attemptedUsername: context.attemptedUsername,
      failureCount: context.failureCount,
      timestamp: new Date().toISOString()
    })
    
    scope.setLevel('warning')
    
    Sentry.captureMessage(`Authentication failure: ${reason}`, 'warning')
  })
}

/**
 * Log rate limit violations
 */
export function logRateLimitViolation(
  endpoint: string,
  context: {
    ipAddress?: string
    userAgent?: string
    requestCount?: number
    windowMs?: number
  } = {}
): void {
  console.warn('Rate limit violation:', endpoint, context)
  
  Sentry.withScope((scope) => {
    scope.setTag('security_event', 'rate_limit')
    scope.setTag('endpoint', endpoint)
    if (context.ipAddress) scope.setTag('ip_address', context.ipAddress)
    
    scope.setContext('rate_limit', {
      endpoint,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestCount: context.requestCount,
      windowMs: context.windowMs,
      timestamp: new Date().toISOString()
    })
    
    scope.setLevel('info')
    
    Sentry.captureMessage(`Rate limit exceeded for ${endpoint}`, 'info')
  })
}

/**
 * Log security events
 */
export function logSecurityEvent(event: SecurityEvent): void {
  console.warn('Security event:', event.type, event)
  
  Sentry.withScope((scope) => {
    scope.setTag('security_event', event.type)
    scope.setTag('severity', event.severity)
    if (event.ipAddress) scope.setTag('ip_address', event.ipAddress)
    if (event.userId) scope.setUser({ id: event.userId })
    
    scope.setContext('security_event', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: new Date().toISOString()
    })
    
    // Set Sentry level based on severity
    const sentryLevel = event.severity === 'critical' ? 'fatal' :
                       event.severity === 'high' ? 'error' :
                       event.severity === 'medium' ? 'warning' : 'info'
    
    scope.setLevel(sentryLevel)
    
    Sentry.captureMessage(`Security event: ${event.type}`, sentryLevel)
  })
}

/**
 * Log CMS operations for audit trail
 */
export function logCMSOperation(
  operation: 'create' | 'update' | 'delete',
  resource: string,
  context: {
    adminId?: string
    resourceId?: string
    changes?: Record<string, any>
    ipAddress?: string
    success: boolean
    error?: string
  }
): void {
  const message = `CMS ${operation} ${resource}: ${context.success ? 'SUCCESS' : 'FAILED'}`
  
  if (context.success) {
    console.log(message, context)
  } else {
    console.error(message, context)
  }
  
  Sentry.withScope((scope) => {
    if (context.adminId) {
      scope.setUser({ id: context.adminId, role: 'admin' })
    }
    
    scope.setTag('cms_operation', operation)
    scope.setTag('resource_type', resource)
    scope.setTag('operation_success', context.success.toString())
    if (context.ipAddress) scope.setTag('ip_address', context.ipAddress)
    
    scope.setContext('cms_operation', {
      operation,
      resource,
      resourceId: context.resourceId,
      changes: context.changes,
      success: context.success,
      error: context.error,
      timestamp: new Date().toISOString()
    })
    
    if (context.success) {
      scope.setLevel('info')
      Sentry.captureMessage(message, 'info')
    } else {
      scope.setLevel('error')
      Sentry.captureMessage(message, 'error')
    }
  })
}

/**
 * Create performance monitoring transaction
 */
export function startPerformanceTransaction(
  name: string,
  operation: string
): any | undefined {
  // Simplified version without deprecated APIs
  console.log(`Performance transaction started: ${name} (${operation})`)
  return {
    name,
    operation,
    startTime: Date.now(),
    setTag: (key: string, value: string) => {},
    finish: () => {
      console.log(`Performance transaction finished: ${name}`)
    }
  }
}

/**
 * Monitor database query performance
 */
export async function monitorDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const transaction = startPerformanceTransaction(
    `db.query.${queryName}`,
    'db.query'
  )
  
  const startTime = Date.now()
  
  try {
    const result = await queryFn()
    
    if (transaction) {
      transaction.setTag('query_success', 'true')
      transaction.finish()
    }
    
    const duration = Date.now() - startTime
    if (duration > 1000) { // Log slow queries
      console.warn(`Slow database query: ${queryName} took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    if (transaction) {
      transaction.setTag('query_success', 'false')
      transaction.finish()
    }
    
    logAPIError(error as Error, {
      action: 'database_query',
      resource: queryName,
      additionalData: { duration: Date.now() - startTime }
    })
    
    throw error
  }
}

/**
 * Monitor API endpoint performance
 */
export async function monitorAPIEndpoint<T>(
  endpoint: string,
  method: string,
  handler: () => Promise<T>
): Promise<T> {
  const transaction = startPerformanceTransaction(
    `api.${method.toLowerCase()}.${endpoint}`,
    'http.server'
  )
  
  const startTime = Date.now()
  
  try {
    const result = await handler()
    
    if (transaction) {
      transaction.setTag('http_status', '200')
      transaction.finish()
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (transaction) {
      transaction.setTag('http_status', '500')
      transaction.finish()
    }
    
    logAPIError(error as Error, {
      action: 'api_request',
      resource: endpoint,
      additionalData: { 
        method,
        duration,
        endpoint
      }
    })
    
    throw error
  }
}

/**
 * Set up error boundaries for React components
 */
export function setupErrorBoundary(): void {
  // This is handled by Sentry's built-in error boundary
  // Just ensure it's properly configured in the app
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      Sentry.captureException(event.reason)
    })
  }
}

/**
 * Health check monitoring
 */
export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

export function logHealthCheck(results: HealthCheckResult[]): void {
  const unhealthyServices = results.filter(r => r.status === 'unhealthy')
  const degradedServices = results.filter(r => r.status === 'degraded')
  
  if (unhealthyServices.length > 0) {
    Sentry.withScope((scope) => {
      scope.setTag('health_check', 'failed')
      scope.setContext('health_check', {
        unhealthyServices: unhealthyServices.map(s => s.service),
        degradedServices: degradedServices.map(s => s.service),
        allResults: results,
        timestamp: new Date().toISOString()
      })
      
      scope.setLevel('error')
      Sentry.captureMessage(
        `Health check failed: ${unhealthyServices.map(s => s.service).join(', ')}`,
        'error'
      )
    })
  } else if (degradedServices.length > 0) {
    Sentry.withScope((scope) => {
      scope.setTag('health_check', 'degraded')
      scope.setContext('health_check', {
        degradedServices: degradedServices.map(s => s.service),
        allResults: results,
        timestamp: new Date().toISOString()
      })
      
      scope.setLevel('warning')
      Sentry.captureMessage(
        `Health check degraded: ${degradedServices.map(s => s.service).join(', ')}`,
        'warning'
      )
    })
  }
}