/**
 * Health Check API
 * Provides system health status for monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { logHealthCheck, type HealthCheckResult } from '@/lib/monitoring'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    
    return {
      service: 'database',
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        provider: 'supabase',
        responseTimeMs: responseTime
      }
    }
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        provider: 'supabase'
      }
    }
  }
}

/**
 * Check Supabase Storage connectivity
 */
async function checkStorage(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const { data, error } = await supabase.storage.listBuckets()
    const responseTime = Date.now() - startTime
    
    if (error) {
      return {
        service: 'storage',
        status: 'unhealthy',
        responseTime,
        error: error.message,
        details: {
          provider: 'supabase'
        }
      }
    }
    
    return {
      service: 'storage',
      status: responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        provider: 'supabase',
        bucketsCount: data?.length || 0,
        responseTimeMs: responseTime
      }
    }
  } catch (error) {
    return {
      service: 'storage',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        provider: 'supabase'
      }
    }
  }
}

/**
 * Check external services (Stripe, PayTR, etc.)
 */
async function checkExternalServices(): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = []
  
  // Check Stripe (if configured)
  if (process.env.STRIPE_SECRET_KEY) {
    const startTime = Date.now()
    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      const responseTime = Date.now() - startTime
      
      results.push({
        service: 'stripe',
        status: response.ok ? (responseTime > 2000 ? 'degraded' : 'healthy') : 'unhealthy',
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`,
        details: {
          httpStatus: response.status,
          responseTimeMs: responseTime
        }
      })
    } catch (error) {
      results.push({
        service: 'stripe',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // Check Sentry (if configured)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    results.push({
      service: 'sentry',
      status: 'healthy',
      details: {
        configured: true,
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN.substring(0, 20) + '...'
      }
    })
  }
  
  return results
}

/**
 * Check system resources and performance
 */
async function checkSystem(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Check memory usage (Node.js)
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    }
    
    // Check if memory usage is concerning
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    const status = heapUsagePercent > 90 ? 'unhealthy' : 
                   heapUsagePercent > 75 ? 'degraded' : 'healthy'
    
    return {
      service: 'system',
      status,
      responseTime: Date.now() - startTime,
      details: {
        memory: memUsageMB,
        heapUsagePercent: Math.round(heapUsagePercent),
        uptime: Math.round(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform
      }
    }
  } catch (error) {
    return {
      service: 'system',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Run all health checks in parallel
    const [
      databaseResult,
      storageResult,
      externalResults,
      systemResult
    ] = await Promise.all([
      checkDatabase(),
      checkStorage(),
      checkExternalServices(),
      checkSystem()
    ])
    
    const allResults = [
      databaseResult,
      storageResult,
      systemResult,
      ...externalResults
    ]
    
    // Determine overall status
    const hasUnhealthy = allResults.some(r => r.status === 'unhealthy')
    const hasDegraded = allResults.some(r => r.status === 'degraded')
    
    const overallStatus = hasUnhealthy ? 'unhealthy' : 
                         hasDegraded ? 'degraded' : 'healthy'
    
    const totalResponseTime = Date.now() - startTime
    
    // Log health check results to monitoring
    logHealthCheck(allResults)
    
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      services: allResults,
      summary: {
        total: allResults.length,
        healthy: allResults.filter(r => r.status === 'healthy').length,
        degraded: allResults.filter(r => r.status === 'degraded').length,
        unhealthy: allResults.filter(r => r.status === 'unhealthy').length
      }
    }
    
    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'unhealthy' ? 503 : 
                      overallStatus === 'degraded' ? 200 : 200
    
    return NextResponse.json(response, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}