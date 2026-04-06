import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requiredEnvVars = [
    'PAYTR_MERCHANT_ID',
    'PAYTR_MERCHANT_KEY', 
    'PAYTR_MERCHANT_SALT',
    'PAYTR_TEST_MODE',
    'NEXT_PUBLIC_APP_URL'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  const hasAllVars = missingVars.length === 0

  return NextResponse.json({
    status: hasAllVars ? 'healthy' : 'unhealthy',
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    missing_variables: missingVars,
    available_variables: requiredEnvVars.filter(varName => !!process.env[varName]),
    paytr_config: {
      merchant_id: process.env.PAYTR_MERCHANT_ID ? 'SET' : 'MISSING',
      merchant_key: process.env.PAYTR_MERCHANT_KEY ? `SET (${process.env.PAYTR_MERCHANT_KEY.length} chars)` : 'MISSING',
      merchant_salt: process.env.PAYTR_MERCHANT_SALT ? `SET (${process.env.PAYTR_MERCHANT_SALT.length} chars)` : 'MISSING',
      test_mode: process.env.PAYTR_TEST_MODE || 'NOT SET',
      app_url: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'
    },
    timestamp: new Date().toISOString()
  })
}