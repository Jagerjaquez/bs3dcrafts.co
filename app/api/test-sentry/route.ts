import { NextResponse } from 'next/server'
import { trackError, trackEvent, BusinessMetrics, SecurityEvents } from '@/lib/monitoring'

export async function GET() {
  try {
    // Test 1: Basic error tracking
    throw new Error('Test error from Sentry - This is a test!')
  } catch (error) {
    trackError(error as Error, {
      category: 'test',
      severity: 'low',
      metadata: { 
        test: true,
        timestamp: new Date().toISOString(),
        testType: 'basic_error'
      },
    })
  }

  // Test 2: Custom event
  trackEvent({
    name: 'sentry_test_event',
    category: 'test',
    severity: 'low',
    metadata: {
      test: true,
      eventType: 'custom_event'
    },
  })

  // Test 3: Business metric
  BusinessMetrics.orderCreated('test-order-123', 299.99)

  // Test 4: Security event
  SecurityEvents.suspiciousActivity('Test security event', {
    test: true,
    ipAddress: '127.0.0.1'
  })

  return NextResponse.json({ 
    success: true,
    message: 'Test events sent to Sentry',
    tests: [
      'Basic error tracking',
      'Custom event',
      'Business metric',
      'Security event'
    ],
    note: 'Check your Sentry dashboard at https://sentry.io'
  })
}
