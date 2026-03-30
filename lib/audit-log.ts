/**
 * Audit Logging
 * 
 * Tracks admin actions for security and compliance
 */

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

// In-memory audit log (in production, this should be stored in database)
const auditLogs: AuditLogEntry[] = []
const MAX_LOGS = 1000 // Keep last 1000 entries in memory

/**
 * Log an audit event
 */
export function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
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
  
  // TODO: In production, store in database
  // await prisma.auditLog.create({ data: logEntry })
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
