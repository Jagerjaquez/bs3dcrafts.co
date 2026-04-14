import { NextResponse } from 'next/server'
import { logAPIError, logSecurityEvent, logCMSOperation } from '@/lib/monitoring'

export async function GET() {
  try {
    // Test 1: Basic error tracking
    throw new Error('Test error from Sentry - This is a test!')
  } catch (error) {
    logAPIError(error as Error, {
      action: 'test_error',
      resource: 'sentry_test',
      additionalData: { 
        test: true,
        timestamp: new Date().toISOString(),
        testType: 'basic_error'
      },
    })
  }

  // Test 2: Security event
  logSecurityEvent({
    type: 'suspicious_activity',
    severity: 'low',
    ipAddress: '127.0.0.1',
    details: {
      test: true,
      eventType: 'test_security_event'
    }
  })

  // Test 3: CMS operation
  logCMSOperation('create', 'test_resource', {
    adminId: 'test-admin',
    resourceId: 'test-123',
    success: true,
    changes: { test: true }
  })

  return NextResponse.json({ 
    success: true,
    message: 'Test events sent to Sentry',
    tests: [
      'Basic error tracking',
      'Security event',
      'CMS operation'
    ],
    note: 'Check your Sentry dashboard at https://sentry.io'
  })
}
