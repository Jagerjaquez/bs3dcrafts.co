import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Environment variables kontrolü
    const config = {
      merchant_id: process.env.PAYTR_MERCHANT_ID,
      merchant_key_exists: !!process.env.PAYTR_MERCHANT_KEY,
      merchant_key_length: process.env.PAYTR_MERCHANT_KEY?.length || 0,
      merchant_salt_exists: !!process.env.PAYTR_MERCHANT_SALT,
      merchant_salt_length: process.env.PAYTR_MERCHANT_SALT?.length || 0,
      test_mode: process.env.PAYTR_TEST_MODE,
      app_url: process.env.NEXT_PUBLIC_APP_URL,
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      vercel_url: process.env.VERCEL_URL,
    }

    // Basit PayTR API test
    let paytrTest = null
    try {
      if (config.merchant_id && process.env.PAYTR_MERCHANT_KEY && process.env.PAYTR_MERCHANT_SALT) {
        const testParams = new URLSearchParams({
          merchant_id: config.merchant_id,
          user_ip: '127.0.0.1',
          merchant_oid: 'STATUSTEST' + Date.now(),
          email: 'test@example.com',
          payment_amount: '100',
          payment_type: 'card',
          installment_count: '0',
          currency: 'TRY',
          test_mode: config.test_mode === 'true' ? '1' : '0',
          non_3d: '0',
          merchant_ok_url: `${config.app_url}/success`,
          merchant_fail_url: `${config.app_url}/checkout`,
          user_name: 'Test User',
          user_address: 'Test Address',
          user_phone: '+905551234567',
          user_basket: Buffer.from(JSON.stringify([{name: 'Test', price: '100', quantity: 1}])).toString('base64'),
          debug_on: '1',
          no_installment: '0',
          max_installment: '12',
          timeout_limit: '30',
          paytr_token: 'test_token_placeholder',
          lang: 'tr',
        })

        const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: testParams.toString(),
        })

        paytrTest = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        }

        if (response.ok) {
          const data = await response.json()
          paytrTest.response = data
        }
      }
    } catch (error) {
      paytrTest = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config,
      paytr_test: paytrTest,
      headers: {
        host: req.headers.get('host'),
        'user-agent': req.headers.get('user-agent'),
        'x-forwarded-for': req.headers.get('x-forwarded-for'),
        'x-real-ip': req.headers.get('x-real-ip'),
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}