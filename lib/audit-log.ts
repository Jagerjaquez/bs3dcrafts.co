/**
 * Audit Logging
 * 
 * Tracks admin actions for security and compliance
 */

import { prisma } from './prisma'
import { 
  logAPIError, 
  logAuthenticationFailure, 
  logSecurityEvent, 
  logCMSOperation 
} from './monitoring'

export type AuditAction =
  | 'admin_login'
  | 'admin_logout'
  | 'admin_login_failed'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'order_status_changed'
  | 'order_viewed'
  | 'settings_changed'
  | 'content_created'
  | 'content_updated'
  | 'content_deleted'
  | 'page_created'
  | 'page_updated'
  | 'page_deleted'
  | 'media_uploaded'
  | 'media_deleted'
  | 'navigation_created'
  | 'navigation_updated'
  | 'navigation_deleted'
  | 'navigation_updated'
  | 'navigation_deleted'

export interface AuditLogEntry {
  timestamp: Date
  action: AuditAction
  userId: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  success: boolean
  errorMessage?: string
}

// In-memory audit log for fast access (cleared on server restart)
const auditLogs: AuditLogEntry[] = []
const MAX_LOGS = 1000 // Keep last 1000 entries in memory

/**
 * Log an audit event (persisted to database)
 */
export async function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  }
  
  // Add to in-memory log
  auditLogs.unshift(logEntry)
  
  // Keep only last MAX_LOGS entries
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.pop()
  }
  
  // Log to console for debugging
  console.log('AUDIT:', {
    timestamp: logEntry.timestamp.toISOString(),
    action: logEntry.action,
    userId: logEntry.userId,
    success: logEntry.success,
    details: logEntry.details,
  })
  
  // Send to monitoring system
  if (!entry.success) {
    // Log authentication failures
    if (entry.action === 'admin_login_failed') {
      logAuthenticationFailure(entry.errorMessage || 'Login failed', {
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        attemptedUsername: entry.userId,
      })
    }
    
    // Log other failures as API errors
    else {
      logAPIError(new Error(entry.errorMessage || 'Operation failed'), {
        userId: entry.userId,
        action: entry.action,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        additionalData: entry.details
      })
    }
  }
  
  // Log CMS operations
  if (entry.action.includes('content') || entry.action.includes('page') || 
      entry.action.includes('media') || entry.action.includes('navigation')) {
    const operation = entry.action.includes('created') ? 'create' :
                     entry.action.includes('updated') ? 'update' : 'delete'
    const resource = entry.action.split('_')[0]
    
    logCMSOperation(operation, resource, {
      adminId: entry.userId,
      resourceId: entry.details?.contentId || entry.details?.pageId || 
                  entry.details?.mediaId || entry.details?.navigationId,
      changes: entry.details,
      ipAddress: entry.ipAddress,
      success: entry.success,
      error: entry.errorMessage
    })
  }
  
  // Persist to database asynchronously (non-blocking)
  try {
    // Determine resource type from action
    let resource = 'admin'
    if (entry.action.includes('product')) resource = 'product'
    else if (entry.action.includes('order')) resource = 'order'
    else if (entry.action.includes('settings')) resource = 'settings'
    else if (entry.action.includes('content')) resource = 'content'
    else if (entry.action.includes('page')) resource = 'page'
    else if (entry.action.includes('media')) resource = 'media'
    else if (entry.action.includes('navigation')) resource = 'navigation'
    
    prisma.auditLog.create({
      data: {
        adminId: entry.userId,
        action: entry.action,
        resource,
        resourceId: entry.details?.productId ||
                    entry.details?.orderId ||
                    entry.details?.pageId ||
                    entry.details?.contentId ||
                    entry.details?.contentKey ||
                    entry.details?.mediaId ||
                    entry.details?.navigationId ||
                    null,
        changes: entry.details ? entry.details : undefined,
        ipAddress: entry.ipAddress || 'unknown',
        userAgent: entry.userAgent || 'unknown',
        success: entry.success,
        errorMessage: entry.errorMessage,
      },
    }).catch((err) => {
      console.error('Failed to persist audit log to database:', err)
      logAPIError(err, {
        action: 'audit_log_persistence',
        resource: 'database',
        additionalData: { originalAction: entry.action }
      })
    })
  } catch (error) {
    console.error('Audit log persistence error:', error)
    logAPIError(error as Error, {
      action: 'audit_log_persistence',
      resource: 'database'
    })
  }
}

/**
 * Get audit logs with optional filtering
 */
export function getAuditLogs(options?: {
  userId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  limit?: number
}): AuditLogEntry[] {
  let filtered = [...auditLogs]
  
  if (options?.userId) {
    filtered = filtered.filter(log => log.userId === options.userId)
  }
  
  if (options?.action) {
    filtered = filtered.filter(log => log.action === options.action)
  }
  
  if (options?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= options.startDate!)
  }
  
  if (options?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= options.endDate!)
  }
  
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit)
  }
  
  return filtered
}

/**
 * Get failed login attempts for rate limiting
 */
export function getFailedLoginAttempts(
  ipAddress: string,
  timeWindowMinutes: number = 15
): number {
  const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
  
  return auditLogs.filter(
    log =>
      log.action === 'admin_login_failed' &&
      log.ipAddress === ipAddress &&
      log.timestamp >= cutoffTime
  ).length
}

/**
 * Clear old audit logs (cleanup task)
 */
export function clearOldAuditLogs(daysToKeep: number = 90): number {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
  const initialLength = auditLogs.length
  
  // Remove logs older than cutoff date
  const filtered = auditLogs.filter(log => log.timestamp >= cutoffDate)
  auditLogs.length = 0
  auditLogs.push(...filtered)
  
  const removed = initialLength - auditLogs.length
  console.log(`Cleared ${removed} old audit logs`)
  
  return removed
}

/**
 * Helper function to log admin action with automatic context
 * 
 * Simplifies logging by automatically extracting IP and user agent
 */
export async function logAdminAction(
  action: AuditAction,
  userId: string,
  request?: Request,
  details?: Record<string, any>
): Promise<void> {
  const ipAddress = request ? getClientIP(request) : 'unknown'
  const userAgent = request ? request.headers.get('user-agent') || 'unknown' : 'unknown'
  
  await logAudit({
    action,
    userId,
    ipAddress,
    userAgent,
    success: true,
    details,
  })
}

/**
 * Helper to get client IP from request
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Get recent audit logs from database
 * 
 * Fetches logs from database for admin dashboard
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    })
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      action: log.action as AuditAction,
      userId: log.adminId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.changes as Record<string, any> | undefined,
      success: log.success,
      errorMessage: log.errorMessage || undefined,
    }))
  } catch (error) {
    console.error('Failed to fetch audit logs from database:', error)
    return []
  }
}

/**
 * Get audit logs for specific resource
 */
export async function getResourceAuditLogs(
  resource: string,
  resourceId: string,
  limit: number = 20
): Promise<AuditLogEntry[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      take: limit,
      orderBy: { timestamp: 'desc' },
    })
    
    return logs.map(log => ({
      timestamp: log.timestamp,
      action: log.action as AuditAction,
      userId: log.adminId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.changes as Record<string, any> | undefined,
      success: log.success,
      errorMessage: log.errorMessage || undefined,
    }))
  } catch (error) {
    console.error('Failed to fetch resource audit logs:', error)
    return []
  }
}
