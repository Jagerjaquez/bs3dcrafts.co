/**
 * Error Handler Module
 * 
 * Provides error types, Turkish error messages, and structured error logging
 * for the Stripe payment integration.
 * 
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */

// Error Response Interface
export interface ErrorResponse {
  error: string           // User-friendly message (Turkish for client-facing)
  code: string           // Machine-readable error code
  details?: string       // Technical details (only in development)
  timestamp: string      // ISO 8601 timestamp
}

// Error Log Interface
export interface ErrorLog {
  timestamp: string
  level: 'error' | 'warn'
  component: string      // 'checkout-api' | 'webhook-handler' | 'order-manager'
  error: string
  stack?: string
  context: {
    endpoint?: string
    userId?: string
    sessionId?: string
    orderId?: string
    [key: string]: any
  }
}

// Turkish Error Messages
export const ERROR_MESSAGES = {
  EMPTY_CART: 'Sepetiniz boş. Lütfen ürün ekleyin.',
  INVALID_FORM: 'Lütfen tüm alanları doldurun.',
  INVALID_PRICE: 'Geçersiz ürün fiyatı.',
  NETWORK_ERROR: 'Bağlantı hatası. Lütfen tekrar deneyin.',
  PAYMENT_FAILED: 'Ödeme işlemi başarısız oldu.',
  SESSION_EXPIRED: 'Oturum süresi doldu. Lütfen tekrar deneyin.',
  RATE_LIMIT: 'Çok fazla istek gönderdiniz. Lütfen bekleyin.',
  GENERIC_ERROR: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
} as const

// Error Codes
export enum ErrorCode {
  EMPTY_CART = 'EMPTY_CART',
  INVALID_FORM = 'INVALID_FORM',
  INVALID_PRICE = 'INVALID_PRICE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RATE_LIMIT = 'RATE_LIMIT',
  GENERIC_ERROR = 'GENERIC_ERROR',
  STRIPE_API_ERROR = 'STRIPE_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEBHOOK_SIGNATURE_ERROR = 'WEBHOOK_SIGNATURE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

/**
 * Creates a standardized error response
 * 
 * @param message - User-friendly error message (Turkish)
 * @param code - Machine-readable error code
 * @param details - Technical details (only included in development)
 * @returns ErrorResponse object
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  details?: string
): ErrorResponse {
  return {
    error: message,
    code,
    details: process.env.NODE_ENV === 'development' ? details : undefined,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Logs an error with structured format
 * 
 * @param component - Component where error occurred
 * @param error - Error object or message
 * @param context - Additional context information
 * @param level - Log level (error or warn)
 */
export function logError(
  component: string,
  error: Error | string,
  context: Record<string, any> = {},
  level: 'error' | 'warn' = 'error'
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level,
    component,
    error: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context,
  }

  // Log to console (in production, this would go to a logging service)
  if (level === 'error') {
    console.error('Error Log:', JSON.stringify(errorLog, null, 2))
  } else {
    console.warn('Warning Log:', JSON.stringify(errorLog, null, 2))
  }
}

/**
 * Wraps an async function with error handling and logging
 * 
 * @param component - Component name for logging
 * @param fn - Async function to wrap
 * @param context - Additional context for logging
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  component: string,
  fn: T,
  context: Record<string, any> = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(component, error as Error, context)
      throw error
    }
  }) as T
}

/**
 * Checks if an error is a Stripe API error
 * 
 * @param error - Error to check
 * @returns true if error is from Stripe API
 */
export function isStripeError(error: any): boolean {
  return error && error.type && error.type.startsWith('Stripe')
}

/**
 * Extracts user-friendly message from Stripe error
 * 
 * @param error - Stripe error object
 * @returns User-friendly error message in Turkish
 */
export function getStripeErrorMessage(error: any): string {
  if (!isStripeError(error)) {
    return ERROR_MESSAGES.GENERIC_ERROR
  }

  // Map common Stripe error types to Turkish messages
  switch (error.type) {
    case 'StripeCardError':
      return 'Kart işlemi başarısız oldu. Lütfen kart bilgilerinizi kontrol edin.'
    case 'StripeRateLimitError':
      return ERROR_MESSAGES.RATE_LIMIT
    case 'StripeInvalidRequestError':
      return ERROR_MESSAGES.INVALID_FORM
    case 'StripeAPIError':
    case 'StripeConnectionError':
      return ERROR_MESSAGES.NETWORK_ERROR
    case 'StripeAuthenticationError':
      return 'Kimlik doğrulama hatası. Lütfen daha sonra tekrar deneyin.'
    default:
      return ERROR_MESSAGES.GENERIC_ERROR
  }
}
