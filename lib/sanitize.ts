/**
 * HTML Sanitization Utility
 * 
 * Provides XSS protection by sanitizing HTML content
 * Uses DOMPurify for safe HTML rendering
 */

import DOMPurify from 'isomorphic-dompurify'

type DOMPurifySanitizeConfig = NonNullable<Parameters<typeof DOMPurify.sanitize>[1]>

/**
 * Allowed HTML tags for rich text content
 */
const ALLOWED_TAGS = [
  // Text formatting
  'p', 'br', 'strong', 'em', 'u', 's', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
  
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  
  // Lists
  'ul', 'ol', 'li',
  
  // Links and media
  'a', 'img',
  
  // Quotes and code
  'blockquote', 'code', 'pre',
  
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  
  // Divs and spans for styling
  'div', 'span',
  
  // Line breaks
  'hr',
]

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'width', 'height', 'style',
  'target', 'rel',
  'colspan', 'rowspan',
]

/**
 * Allowed URL schemes for links and images
 */
const ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i

/**
 * Sanitize HTML content
 * 
 * Removes potentially dangerous HTML while preserving safe formatting
 * 
 * @param html - Raw HTML content
 * @param options - Optional sanitization options
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(
  html: string,
  options?: {
    allowedTags?: string[]
    allowedAttributes?: string[]
    allowDataAttributes?: boolean
  }
): string {
  if (!html) {
    return ''
  }

  const config: DOMPurifySanitizeConfig = {
    ALLOWED_TAGS: options?.allowedTags || ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttributes || ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    ALLOW_DATA_ATTR: options?.allowDataAttributes || false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    FORCE_BODY: false,
  }

  return DOMPurify.sanitize(html, config)
}

/**
 * Sanitize HTML for plain text display
 * 
 * Strips all HTML tags and returns plain text
 * 
 * @param html - Raw HTML content
 * @returns Plain text string
 */
export function sanitizeToPlainText(html: string): string {
  if (!html) {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize HTML for basic formatting only
 * 
 * Allows only basic text formatting (bold, italic, links)
 * Useful for user comments or short descriptions
 * 
 * @param html - Raw HTML content
 * @returns Sanitized HTML string
 */
export function sanitizeBasicHTML(html: string): string {
  if (!html) {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP,
  })
}

/**
 * Sanitize URL
 * 
 * Validates and sanitizes URLs to prevent javascript: and data: URIs
 * 
 * @param url - Raw URL string
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url) {
    return ''
  }

  // Remove whitespace
  url = url.trim()

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = url.toLowerCase()

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return ''
    }
  }

  // Allow relative URLs, http, https, mailto, tel
  if (
    url.startsWith('/') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:')
  ) {
    return url
  }

  // Invalid URL
  return ''
}

/**
 * Test HTML for XSS vulnerabilities
 * 
 * Useful for testing sanitization effectiveness
 * 
 * @param html - HTML to test
 * @returns True if HTML contains potential XSS
 */
export function containsXSS(html: string): boolean {
  if (!html) {
    return false
  }

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<applet/i,
    /<meta/i,
    /<link/i,
    /<style/i,
    /data:text\/html/i,
    /vbscript:/i,
  ]

  return xssPatterns.some(pattern => pattern.test(html))
}

/**
 * Escape HTML entities
 * 
 * Converts special characters to HTML entities
 * Use when you want to display HTML as text
 * 
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeHTML(text: string): string {
  if (!text) {
    return ''
  }

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, char => htmlEntities[char])
}

/**
 * Unescape HTML entities
 * 
 * Converts HTML entities back to special characters
 * 
 * @param text - Text with HTML entities
 * @returns Unescaped text
 */
export function unescapeHTML(text: string): string {
  if (!text) {
    return ''
  }

  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
  }

  return text.replace(/&(?:amp|lt|gt|quot|#39|#x2F);/g, entity => htmlEntities[entity])
}

/**
 * Sanitize filename
 * 
 * Removes dangerous characters from filenames
 * 
 * @param filename - Raw filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) {
    return ''
  }

  // Remove path traversal attempts
  filename = filename.replace(/\.\./g, '')

  // Remove special characters except dots, hyphens, underscores
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Limit length
  if (filename.length > 255) {
    const ext = filename.split('.').pop() || ''
    const name = filename.substring(0, 255 - ext.length - 1)
    filename = `${name}.${ext}`
  }

  return filename
}

/**
 * Validate and sanitize JSON
 * 
 * Ensures JSON is valid and safe
 * 
 * @param json - JSON string
 * @returns Parsed and validated JSON object or null
 */
export function sanitizeJSON(json: string): Record<string, any> | null {
  if (!json) {
    return null
  }

  try {
    const parsed = JSON.parse(json)

    // Ensure it's an object
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }

    // Remove any functions or undefined values
    return JSON.parse(JSON.stringify(parsed))
  } catch (error) {
    return null
  }
}

/**
 * Sanitize CSS
 * 
 * Removes potentially dangerous CSS
 * 
 * @param css - CSS string
 * @returns Sanitized CSS
 */
export function sanitizeCSS(css: string): string {
  if (!css) {
    return ''
  }

  // Remove dangerous CSS properties
  const dangerousPatterns = [
    /expression\s*\(/gi,
    /javascript:/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /import\s+/gi,
    /@import/gi,
  ]

  let sanitized = css

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }

  return sanitized
}
