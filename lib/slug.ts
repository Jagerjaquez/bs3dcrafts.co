/**
 * Slug Generation Utility
 * 
 * Generates URL-safe slugs from strings
 * Handles special characters, spaces, and ensures uniqueness
 */

import { prisma } from './prisma'

/**
 * Generate URL-safe slug from text
 * 
 * Converts text to lowercase, replaces spaces with hyphens,
 * removes special characters, and trims leading/trailing hyphens
 * 
 * @param text - Input text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  if (!text) {
    return ''
  }

  return text
    .toLowerCase()
    .trim()
    // Replace Turkish characters
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Remove accents from other characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters (keep only alphanumeric and hyphens)
    .replace(/[^\w-]+/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
}

/**
 * Generate unique slug for pages
 * 
 * Checks if slug exists in database and appends number if needed
 * 
 * @param text - Input text to convert to slug
 * @param excludeId - Optional page ID to exclude from uniqueness check (for updates)
 * @returns Unique URL-safe slug
 */
export async function generateUniquePageSlug(
  text: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(text)
  
  if (!baseSlug) {
    throw new Error('Cannot generate slug from empty text')
  }

  let slug = baseSlug
  let counter = 1

  while (true) {
    // Check if slug exists
    const existing = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    })

    // If doesn't exist or is the same page being updated, use it
    if (!existing || existing.id === excludeId) {
      return slug
    }

    // Append counter and try again
    slug = `${baseSlug}-${counter}`
    counter++

    // Safety limit to prevent infinite loop
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug')
    }
  }
}

/**
 * Generate unique slug for products
 * 
 * Checks if slug exists in database and appends number if needed
 * 
 * @param text - Input text to convert to slug
 * @param excludeId - Optional product ID to exclude from uniqueness check (for updates)
 * @returns Unique URL-safe slug
 */
export async function generateUniqueProductSlug(
  text: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(text)
  
  if (!baseSlug) {
    throw new Error('Cannot generate slug from empty text')
  }

  let slug = baseSlug
  let counter = 1

  while (true) {
    // Check if slug exists
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    // If doesn't exist or is the same product being updated, use it
    if (!existing || existing.id === excludeId) {
      return slug
    }

    // Append counter and try again
    slug = `${baseSlug}-${counter}`
    counter++

    // Safety limit to prevent infinite loop
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug')
    }
  }
}

/**
 * Validate slug format
 * 
 * Checks if slug is URL-safe
 * 
 * @param slug - Slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) {
    return false
  }

  // Must be lowercase alphanumeric with hyphens only
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  return slugPattern.test(slug)
}

/**
 * Sanitize slug
 * 
 * Ensures slug is URL-safe even if manually entered
 * 
 * @param slug - Raw slug input
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) {
    return ''
  }

  return generateSlug(slug)
}

/**
 * Generate slug with prefix
 * 
 * Useful for categorizing content by type
 * 
 * @param text - Input text
 * @param prefix - Prefix to add (e.g., 'blog', 'product')
 * @returns Slug with prefix
 */
export function generateSlugWithPrefix(text: string, prefix: string): string {
  const slug = generateSlug(text)
  const prefixSlug = generateSlug(prefix)
  
  if (!slug) {
    return prefixSlug
  }
  
  if (!prefixSlug) {
    return slug
  }
  
  return `${prefixSlug}-${slug}`
}

/**
 * Extract slug from URL
 * 
 * Gets the last segment of a URL path
 * 
 * @param url - Full URL or path
 * @returns Slug from URL
 */
export function extractSlugFromURL(url: string): string {
  if (!url) {
    return ''
  }

  try {
    // Handle full URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)
      url = urlObj.pathname
    }

    // Remove leading/trailing slashes
    url = url.replace(/^\/+|\/+$/g, '')

    // Get last segment
    const segments = url.split('/')
    return segments[segments.length - 1] || ''
  } catch (error) {
    return ''
  }
}

/**
 * Generate slug from title with fallback
 * 
 * Generates slug from title, falls back to random string if empty
 * 
 * @param title - Title to convert
 * @returns Slug or random string
 */
export function generateSlugWithFallback(title: string): string {
  const slug = generateSlug(title)
  
  if (slug) {
    return slug
  }
  
  // Generate random slug as fallback
  return `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Check if page slug exists
 * 
 * @param slug - Slug to check
 * @param excludeId - Optional page ID to exclude
 * @returns True if slug exists
 */
export async function pageSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.page.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existing) {
    return false
  }

  if (excludeId && existing.id === excludeId) {
    return false
  }

  return true
}

/**
 * Check if product slug exists
 * 
 * @param slug - Slug to check
 * @param excludeId - Optional product ID to exclude
 * @returns True if slug exists
 */
export async function productSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existing) {
    return false
  }

  if (excludeId && existing.id === excludeId) {
    return false
  }

  return true
}

/**
 * Suggest alternative slugs
 * 
 * Generates alternative slug suggestions if the desired slug is taken
 * 
 * @param baseSlug - Base slug that's taken
 * @param count - Number of suggestions to generate
 * @returns Array of alternative slugs
 */
export function suggestAlternativeSlugs(baseSlug: string, count: number = 5): string[] {
  const suggestions: string[] = []
  
  for (let i = 1; i <= count; i++) {
    suggestions.push(`${baseSlug}-${i}`)
  }
  
  // Add some creative variations
  suggestions.push(`${baseSlug}-new`)
  suggestions.push(`${baseSlug}-latest`)
  suggestions.push(`${baseSlug}-${new Date().getFullYear()}`)
  
  return suggestions.slice(0, count)
}
