/**
 * Input Validation Utilities
 * 
 * Provides validation functions for user input to prevent injection attacks
 */

// Maximum string lengths to prevent buffer overflow
export const MAX_LENGTHS = {
  NAME: 100,
  EMAIL: 255,
  PHONE: 20,
  ADDRESS: 500,
  DESCRIPTION: 5000,
  SLUG: 100,
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_LENGTHS.EMAIL) {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.length > MAX_LENGTHS.PHONE) {
    return false
  }
  
  // Allow international format with +
  const phoneRegex = /^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Validate price (must be positive)
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && isFinite(price)
}

/**
 * Validate stock quantity (must be non-negative integer)
 */
export function isValidStock(stock: number): boolean {
  return typeof stock === 'number' && stock >= 0 && Number.isInteger(stock)
}

/**
 * Validate string length
 */
export function isValidLength(str: string, maxLength: number): boolean {
  return typeof str === 'string' && str.length > 0 && str.length <= maxLength
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove null bytes and control characters
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
}

/**
 * Validate slug format (URL-safe)
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > MAX_LENGTHS.SLUG) {
    return false
  }
  
  // Only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Detect potential XSS patterns
 */
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Detect potential SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate product data
 */
export interface ProductValidationResult {
  valid: boolean
  errors: string[]
}

export function validateProductData(data: any): ProductValidationResult {
  const errors: string[] = []

  // Name validation
  if (!data.name || !isValidLength(data.name, MAX_LENGTHS.NAME)) {
    errors.push('Ürün adı geçersiz veya çok uzun')
  }
  if (containsXSS(data.name)) {
    errors.push('Ürün adı geçersiz karakterler içeriyor')
  }

  // Slug validation
  if (!data.slug || !isValidSlug(data.slug)) {
    errors.push('Ürün slug\'ı geçersiz')
  }

  // Price validation
  if (!isValidPrice(data.price)) {
    errors.push('Fiyat pozitif bir sayı olmalıdır')
  }

  // Stock validation
  if (data.stock !== undefined && !isValidStock(data.stock)) {
    errors.push('Stok miktarı geçerli bir sayı olmalıdır')
  }

  // Description validation
  if (data.description && !isValidLength(data.description, MAX_LENGTHS.DESCRIPTION)) {
    errors.push('Açıklama çok uzun')
  }
  if (data.description && containsXSS(data.description)) {
    errors.push('Açıklama geçersiz karakterler içeriyor')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate customer data
 */
export function validateCustomerData(data: any): ProductValidationResult {
  const errors: string[] = []

  // Name validation
  if (!data.name || !isValidLength(data.name, MAX_LENGTHS.NAME)) {
    errors.push('İsim geçersiz veya çok uzun')
  }
  if (containsXSS(data.name) || containsSQLInjection(data.name)) {
    errors.push('İsim geçersiz karakterler içeriyor')
  }

  // Email validation
  if (!isValidEmail(data.email)) {
    errors.push('E-posta adresi geçersiz')
  }

  // Phone validation
  if (!isValidPhone(data.phone)) {
    errors.push('Telefon numarası geçersiz')
  }

  // Address validation
  if (!data.address || !isValidLength(data.address, MAX_LENGTHS.ADDRESS)) {
    errors.push('Adres geçersiz veya çok uzun')
  }
  if (containsXSS(data.address) || containsSQLInjection(data.address)) {
    errors.push('Adres geçersiz karakterler içeriyor')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate order items
 */
export function validateOrderItems(items: any[]): ProductValidationResult {
  const errors: string[] = []

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Sipariş boş olamaz')
    return { valid: false, errors }
  }

  items.forEach((item, index) => {
    if (!item.id) {
      errors.push(`Ürün ${index + 1}: ID eksik`)
    }
    if (!item.name || !isValidLength(item.name, MAX_LENGTHS.NAME)) {
      errors.push(`Ürün ${index + 1}: İsim geçersiz`)
    }
    if (!isValidPrice(item.price)) {
      errors.push(`Ürün ${index + 1}: Fiyat geçersiz`)
    }
    if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push(`Ürün ${index + 1}: Miktar geçersiz`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
