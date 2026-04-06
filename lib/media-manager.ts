import { prisma } from './prisma'
import { optimizeImage, validateImageType, validateImageSize, getDimensionsString } from './image-optimization'
import { uploadOptimizedImages, deleteImagesFromStorage } from './supabase-storage'

export interface MediaUploadResult {
  id: string
  filename: string
  urls: {
    thumbnail: string
    medium: string
    large: string
  }
  size: number
  dimensions: string
  type: string
}

export interface MediaItem {
  id: string
  filename: string
  url: string
  type: string
  size: number
  dimensions: string | null
  usageCount: number
  uploadedAt: Date
}

/**
 * Uploads and processes a media file
 */
export async function uploadMedia(
  file: File,
  buffer: Buffer
): Promise<MediaUploadResult> {
  // Validate file type
  if (!validateImageType(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
  }

  // Validate file size
  if (!validateImageSize(file.size)) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }

  try {
    // Optimize the image
    const { sizes, originalDimensions } = await optimizeImage(buffer)

    // Generate base name for files
    const baseName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars
      .toLowerCase()
      .substring(0, 30) // Limit length

    // Upload to Supabase Storage
    const urls = await uploadOptimizedImages(sizes, baseName)

    // Create media record in database
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: urls.large, // Store the large version as the main URL
        type: 'image',
        size: file.size,
        dimensions: getDimensionsString(originalDimensions.width, originalDimensions.height),
        usageCount: 0
      }
    })

    return {
      id: media.id,
      filename: media.filename,
      urls,
      size: media.size,
      dimensions: media.dimensions || '',
      type: media.type
    }
  } catch (error) {
    console.error('Media upload failed:', error)
    throw new Error('Failed to upload media file')
  }
}

/**
 * Gets all media with pagination and filtering
 */
export async function getMediaList(options: {
  page?: number
  limit?: number
  search?: string
  type?: string
  sortBy?: 'uploadedAt' | 'filename' | 'size'
  sortOrder?: 'asc' | 'desc'
} = {}): Promise<{
  media: MediaItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const {
    page = 1,
    limit = 20,
    search,
    type,
    sortBy = 'uploadedAt',
    sortOrder = 'desc'
  } = options

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}
  
  if (search) {
    where.filename = {
      contains: search,
      mode: 'insensitive'
    }
  }
  
  if (type) {
    where.type = type
  }

  // Get total count
  const total = await prisma.media.count({ where })

  // Get media items
  const media = await prisma.media.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder
    }
  })

  return {
    media,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Gets a single media item by ID
 */
export async function getMediaById(id: string): Promise<MediaItem | null> {
  return await prisma.media.findUnique({
    where: { id }
  })
}

/**
 * Deletes a media item
 */
export async function deleteMedia(id: string): Promise<{
  success: boolean
  message: string
  usageDetails?: any[]
}> {
  try {
    const media = await prisma.media.findUnique({
      where: { id }
    })

    if (!media) {
      return {
        success: false,
        message: 'Media not found'
      }
    }

    // Check if media is in use
    if (media.usageCount > 0) {
      // Get usage details (this would need to be expanded based on actual usage tracking)
      const usageDetails = await getMediaUsageDetails(id)
      
      return {
        success: false,
        message: `Media is currently in use in ${media.usageCount} location(s)`,
        usageDetails
      }
    }

    // Extract all URLs that need to be deleted from storage
    const urlsToDelete = [media.url]
    
    // If we stored multiple sizes, we'd need to extract them here
    // For now, we'll try to construct the other URLs based on the pattern
    const baseUrl = media.url.replace('-large-', '-')
    urlsToDelete.push(
      baseUrl.replace('-large-', '-thumbnail-'),
      baseUrl.replace('-large-', '-medium-')
    )

    // Delete from storage
    try {
      await deleteImagesFromStorage(urlsToDelete)
    } catch (storageError) {
      console.error('Failed to delete from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Media deleted successfully'
    }
  } catch (error) {
    console.error('Media deletion failed:', error)
    return {
      success: false,
      message: 'Failed to delete media'
    }
  }
}

/**
 * Updates media usage count
 */
export async function updateMediaUsage(id: string, increment: number): Promise<void> {
  await prisma.media.update({
    where: { id },
    data: {
      usageCount: {
        increment
      }
    }
  })
}

/**
 * Gets details about where a media item is being used
 * This is a placeholder - would need to be implemented based on actual usage tracking
 */
async function getMediaUsageDetails(mediaId: string): Promise<any[]> {
  // This would query various tables to find where the media is used
  // For example: ProductMedia, SiteContent, Page content, etc.
  
  const usageDetails = []

  // Check ProductMedia
  const productUsage = await prisma.productMedia.findMany({
    where: { url: { contains: mediaId } },
    include: { product: { select: { name: true, slug: true } } }
  })

  for (const usage of productUsage) {
    usageDetails.push({
      type: 'product',
      name: usage.product.name,
      url: `/admin/products/${usage.productId}`
    })
  }

  // Add other usage checks here (SiteContent, Page content, etc.)

  return usageDetails
}

/**
 * Searches media by filename
 */
export async function searchMedia(query: string, limit: number = 10): Promise<MediaItem[]> {
  return await prisma.media.findMany({
    where: {
      filename: {
        contains: query,
        mode: 'insensitive'
      }
    },
    take: limit,
    orderBy: {
      uploadedAt: 'desc'
    }
  })
}