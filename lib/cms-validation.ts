/**
 * CMS Validation Schemas
 * 
 * Zod schemas for validating CMS content, pages, products, settings, and navigation
 */

import { z } from 'zod'

/**
 * Page Schema
 * 
 * Validates page creation and updates
 */
export const PageSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric with hyphens only')
    .max(100, 'Slug must be 100 characters or less'),
  
  content: z.string()
    .min(1, 'Content is required'),
  
  metaTitle: z.string()
    .max(60, 'Meta title must be 60 characters or less')
    .optional()
    .nullable(),
  
  metaDescription: z.string()
    .max(160, 'Meta description must be 160 characters or less')
    .optional()
    .nullable(),
  
  keywords: z.string()
    .max(255, 'Keywords must be 255 characters or less')
    .optional()
    .nullable(),
  
  status: z.enum(['draft', 'published']),
})

export type PageInput = z.infer<typeof PageSchema>

/**
 * Product Schema
 * 
 * Validates product creation and updates
 */
export const ProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be 100 characters or less'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric with hyphens only')
    .max(100, 'Slug must be 100 characters or less'),
  
  description: z.string()
    .min(1, 'Description is required'),
  
  price: z.number()
    .positive('Price must be a positive number')
    .finite('Price must be a valid number'),
  
  discountedPrice: z.number()
    .positive('Discounted price must be a positive number')
    .finite('Discounted price must be a valid number')
    .optional()
    .nullable(),
  
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be 50 characters or less'),
  
  material: z.string()
    .min(1, 'Material is required')
    .max(100, 'Material must be 100 characters or less'),
  
  printTimeEstimate: z.string()
    .min(1, 'Print time estimate is required')
    .max(50, 'Print time estimate must be 50 characters or less'),
  
  weight: z.number()
    .positive('Weight must be a positive number')
    .finite('Weight must be a valid number'),
  
  featured: z.boolean(),
  
  status: z.enum(['draft', 'published']),
})

export type ProductInput = z.infer<typeof ProductSchema>

/**
 * Settings Schema
 * 
 * Validates site settings
 */
export const SettingsSchema = z.object({
  key: z.string()
    .min(1, 'Setting key is required')
    .max(100, 'Setting key must be 100 characters or less'),
  
  value: z.string()
    .max(5000, 'Setting value must be 5000 characters or less'),
  
  category: z.enum(['general', 'contact', 'social', 'email', 'analytics', 'features']),
})

export type SettingsInput = z.infer<typeof SettingsSchema>

/**
 * Bulk Settings Update Schema
 * 
 * Validates multiple settings updates at once
 */
export const BulkSettingsSchema = z.record(z.string(), z.string())

export type BulkSettingsInput = z.infer<typeof BulkSettingsSchema>

/**
 * Navigation Schema
 * 
 * Validates navigation menu items
 */
export const NavigationSchema = z.object({
  type: z.enum(['header', 'footer']),
  
  label: z.string()
    .min(1, 'Label is required')
    .max(50, 'Label must be 50 characters or less'),
  
  url: z.string()
    .min(1, 'URL is required')
    .max(255, 'URL must be 255 characters or less')
    .refine((url) => {
      // Allow relative URLs starting with / or absolute URLs
      return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
    }, 'URL must be a valid relative or absolute URL'),
  
  parentId: z.string()
    .optional()
    .nullable(),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative')
    .default(0),
})

export type NavigationInput = z.infer<typeof NavigationSchema>

/**
 * Content Schema
 * 
 * Validates dynamic content sections (hero, carousel, testimonials, etc.)
 */
export const ContentSchema = z.object({
  key: z.string()
    .min(1, 'Content key is required')
    .max(100, 'Content key must be 100 characters or less'),
  
  value: z.record(z.string(), z.any()), // JSON object
  
  section: z.string()
    .min(1, 'Section is required')
    .max(50, 'Section must be 50 characters or less'),
})

export type ContentInput = z.infer<typeof ContentSchema>

/**
 * Hero Section Schema
 * 
 * Validates homepage hero section
 */
export const HeroSectionSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  
  buttonText: z.string()
    .min(1, 'Button text is required')
    .max(50, 'Button text must be 50 characters or less'),
  
  buttonUrl: z.string()
    .min(1, 'Button URL is required')
    .max(255, 'Button URL must be 255 characters or less'),
  
  backgroundImage: z.string()
    .url('Background image must be a valid URL')
    .optional()
    .nullable(),
})

export type HeroSectionInput = z.infer<typeof HeroSectionSchema>

/**
 * Carousel Item Schema
 * 
 * Validates carousel/slider items
 */
export const CarouselItemSchema = z.object({
  id: z.string().optional(),
  
  image: z.string()
    .url('Image must be a valid URL'),
  
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  
  link: z.string()
    .max(255, 'Link must be 255 characters or less')
    .optional()
    .nullable(),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative'),
})

export type CarouselItemInput = z.infer<typeof CarouselItemSchema>

/**
 * Testimonial Schema
 * 
 * Validates customer testimonials
 */
export const TestimonialSchema = z.object({
  id: z.string().optional(),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  
  role: z.string()
    .max(100, 'Role must be 100 characters or less')
    .optional()
    .nullable(),
  
  comment: z.string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be 1000 characters or less'),
  
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  
  avatar: z.string()
    .url('Avatar must be a valid URL')
    .optional()
    .nullable(),
})

export type TestimonialInput = z.infer<typeof TestimonialSchema>

/**
 * Media Upload Schema
 * 
 * Validates media file uploads
 */
export const MediaUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be 255 characters or less'),
  
  type: z.enum(['image', '3d']),
  
  size: z.number()
    .int('Size must be an integer')
    .positive('Size must be positive')
    .max(5 * 1024 * 1024, 'File size must be 5MB or less'),
})

export type MediaUploadInput = z.infer<typeof MediaUploadSchema>

/**
 * Order Status Update Schema
 * 
 * Validates order status updates
 */
export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled']),
  
  trackingNumber: z.string()
    .max(100, 'Tracking number must be 100 characters or less')
    .optional()
    .nullable(),
}).refine((data) => {
  // If status is shipped, tracking number is required
  if (data.status === 'shipped' && !data.trackingNumber) {
    return false
  }
  return true
}, {
  message: 'Tracking number is required when status is shipped',
  path: ['trackingNumber'],
})

export type OrderStatusUpdateInput = z.infer<typeof OrderStatusUpdateSchema>

/**
 * Email Validation Helper
 * 
 * Validates email addresses
 */
export const EmailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email must be 255 characters or less')

/**
 * URL Validation Helper
 * 
 * Validates URLs
 */
export const URLSchema = z.string()
  .url('Invalid URL')
  .max(500, 'URL must be 500 characters or less')

/**
 * Slug Generation Helper
 * 
 * Generates URL-safe slugs from strings
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Validation Error Formatter
 * 
 * Formats Zod validation errors for API responses
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }
  
  return formatted
}

/**
 * Safe Parse Helper
 * 
 * Safely parses data with schema and returns formatted errors
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    errors: formatValidationErrors(result.error),
  }
}
