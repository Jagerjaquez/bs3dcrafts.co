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

      const data = await response.json()
      return data as PayTRTokenResponse
    } catch (error) {
      console.error('PayTR token generation error:', error)
      return {
        status: 'failed',
        reason: 'Network error',
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
  merchant_id: process.env.PAYTR_MERCHANT_ID!,
  merchant_key: process.env.PAYTR_MERCHANT_KEY!,
  merchant_salt: process.env.PAYTR_MERCHANT_SALT!,
  test_mode: process.env.PAYTR_TEST_MODE === 'true',
  no_installment: false,
  max_installment: 12,
})
