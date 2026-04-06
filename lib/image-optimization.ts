import sharp from 'sharp'

export interface OptimizedImageSizes {
  thumbnail: Buffer
  medium: Buffer
  large: Buffer
}

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Optimizes an image by generating three sizes: thumbnail, medium, and large
 * All images are converted to WebP format for better compression
 * Aspect ratio is preserved during resizing
 */
export async function optimizeImage(
  buffer: Buffer
): Promise<{
  sizes: OptimizedImageSizes
  originalDimensions: ImageDimensions
}> {
  try {
    // Get original image metadata
    const metadata = await sharp(buffer).metadata()
    const originalDimensions: ImageDimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0
    }

    // Generate thumbnail (150x150) - crop to square
    const thumbnail = await sharp(buffer)
      .resize(150, 150, { 
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Generate medium size (600x600) - preserve aspect ratio
    const medium = await sharp(buffer)
      .resize(600, 600, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer()

    // Generate large size (1200x1200) - preserve aspect ratio
    const large = await sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 90 })
      .toBuffer()

    return {
      sizes: {
        thumbnail,
        medium,
        large
      },
      originalDimensions
    }
  } catch (error) {
    console.error('Image optimization failed:', error)
    throw new Error('Failed to optimize image')
  }
}

/**
 * Validates if the uploaded file is a supported image type
 */
export function validateImageType(mimeType: string): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]
  
  return supportedTypes.includes(mimeType.toLowerCase())
}

/**
 * Validates if the file size is within the allowed limit (5MB)
 */
export function validateImageSize(size: number): boolean {
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  return size <= maxSize
}

/**
 * Generates a unique filename for the uploaded image
 */
export function generateImageFilename(originalName: string, size: 'thumbnail' | 'medium' | 'large'): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = 'webp' // All optimized images are WebP
  
  // Remove extension from original name and sanitize
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with hyphens
    .toLowerCase()
    .substring(0, 50) // Limit length
  
  return `${baseName}-${size}-${timestamp}-${randomString}.${extension}`
}

/**
 * Gets the dimensions string for storage
 */
export function getDimensionsString(width: number, height: number): string {
  return `${width}x${height}`
}