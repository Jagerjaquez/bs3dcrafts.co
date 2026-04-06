import crypto from 'crypto'

export interface PayTRConfig {
  merchant_id: string
  merchant_key: string
  merchant_salt: string
  test_mode?: boolean
  no_installment?: boolean
  max_installment?: number
  timeout_limit?: number
}

export interface PayTRBasketItem {
  name: string
  price: string
  quantity: number
}

export interface PayTRPaymentRequest {
  merchant_oid: string
  payment_amount: string
  currency: string
  email: string
  user_ip: string
  user_name: string
  user_phone: string
  user_address: string
  user_basket: PayTRBasketItem[]
  merchant_ok_url: string
  merchant_fail_url: string
}

export interface PayTRTokenResponse {
  status: 'success' | 'failed'
  token?: string
  reason?: string
}

export class PayTRClient {
  private config: PayTRConfig

  constructor(config: PayTRConfig) {
    this.config = {
      test_mode: false,
      no_installment: false,
      max_installment: 0,
      timeout_limit: 30,
      ...config,
    }
  }

  async getToken(request: PayTRPaymentRequest): Promise<PayTRTokenResponse> {
    const {
      merchant_oid,
      payment_amount,
      currency,
      email,
      user_ip,
      user_name,
      user_phone,
      user_address,
      user_basket,
      merchant_ok_url,
      merchant_fail_url,
    } = request

    // Validate required fields
    if (!this.config.merchant_id || !this.config.merchant_key || !this.config.merchant_salt) {
      console.error('PayTR configuration missing required fields')
      return {
        status: 'failed',
        reason: 'PayTR configuration incomplete',
      }
    }

    // Debug: Log merchant config (only in test mode)
    if (this.config.test_mode) {
      console.log('=== PayTR Client Debug ===')
      console.log('Merchant ID:', this.config.merchant_id)
      console.log('Merchant Key (first 10 chars):', this.config.merchant_key?.substring(0, 10))
      console.log('Merchant Salt (first 10 chars):', this.config.merchant_salt?.substring(0, 10))
      console.log('Test Mode:', this.config.test_mode)
      console.log('Payment Amount:', payment_amount)
      console.log('User Basket:', JSON.stringify(user_basket, null, 2))
      console.log('=====================')
    }

    // Encode basket as base64
    const user_basket_encoded = Buffer.from(JSON.stringify(user_basket)).toString('base64')

    // Generate hash token
    const hashStr = [
      this.config.merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      user_basket_encoded,
      this.config.no_installment ? '1' : '0',
      this.config.max_installment,
      currency,
      this.config.test_mode ? '1' : '0',
      this.config.merchant_salt,
    ].join('')

    const paytr_token = crypto
      .createHmac('sha256', this.config.merchant_key)
      .update(hashStr)
      .digest('base64')

    // Prepare request body
    const params = new URLSearchParams({
      merchant_id: this.config.merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      payment_type: 'card',
      installment_count: '0',
      currency,
      test_mode: this.config.test_mode ? '1' : '0',
      non_3d: '0',
      merchant_ok_url,
      merchant_fail_url,
      user_name,
      user_address,
      user_phone,
      user_basket: user_basket_encoded,
      debug_on: this.config.test_mode ? '1' : '0',
      no_installment: this.config.no_installment ? '1' : '0',
      max_installment: (this.config.max_installment || 0).toString(),
      timeout_limit: (this.config.timeout_limit || 30).toString(),
      paytr_token,
      lang: 'tr',
    })

    try {
      const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        console.error('PayTR API HTTP error:', response.status, response.statusText)
        
        // Response body'yi de logla
        let errorBody = ''
        try {
          errorBody = await response.text()
          console.error('PayTR API Error Body:', errorBody)
        } catch (e) {
          console.error('Could not read error response body')
        }
        
        return {
          status: 'failed',
          reason: `HTTP ${response.status}: ${response.statusText}${errorBody ? ' - ' + errorBody : ''}`,
        }
      }

      const data = await response.json()
      
      // Log response in test mode or if there's an error
      if (this.config.test_mode || data.status === 'failed') {
        console.log('PayTR API Response:', data)
      }
      
      // Check if PayTR returned an error in the response body
      if (data.status === 'failed' && data.reason) {
        console.error('PayTR API Error:', data.reason)
        return {
          status: 'failed',
          reason: data.reason,
        }
      }
      
      return data as PayTRTokenResponse
    } catch (error) {
      console.error('PayTR token generation error:', error)
      return {
        status: 'failed',
        reason: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  verifyCallback(postData: Record<string, string>): boolean {
    const { merchant_oid, status, total_amount, hash } = postData

    const hashStr = [
      merchant_oid,
      this.config.merchant_salt,
      status,
      total_amount,
    ].join('')

    const calculatedHash = crypto
      .createHmac('sha256', this.config.merchant_key)
      .update(hashStr)
      .digest('base64')

    return hash === calculatedHash
  }
}

// Singleton instance
export const paytr = new PayTRClient({
  merchant_id: process.env.PAYTR_MERCHANT_ID?.trim() || '',
  merchant_key: process.env.PAYTR_MERCHANT_KEY?.trim() || '',
  merchant_salt: process.env.PAYTR_MERCHANT_SALT?.trim() || '',
  test_mode: process.env.PAYTR_TEST_MODE === 'true',
  no_installment: false,
  max_installment: 12,
})

// Debug PayTR configuration on startup
if (process.env.PAYTR_TEST_MODE === 'true') {
  console.log('=== PayTR Configuration Debug ===')
  console.log('Merchant ID:', process.env.PAYTR_MERCHANT_ID ? 'SET' : 'MISSING')
  console.log('Merchant Key:', process.env.PAYTR_MERCHANT_KEY ? 'SET' : 'MISSING')
  console.log('Merchant Salt:', process.env.PAYTR_MERCHANT_SALT ? 'SET' : 'MISSING')
  console.log('Test Mode:', process.env.PAYTR_TEST_MODE)
  console.log('================================')
}
