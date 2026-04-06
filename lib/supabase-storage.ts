import { supabaseAdmin } from './supabase-server'

export interface UploadedImageUrls {
  thumbnail: string
  medium: string
  large: string
}

/**
 * Uploads optimized image buffers to Supabase Storage
 * Returns the public URLs for each size
 */
export async function uploadOptimizedImages(
  buffers: {
    thumbnail: Buffer
    medium: Buffer
    large: Buffer
  },
  baseName: string
): Promise<UploadedImageUrls> {
  const bucket = 'media'
  
  try {
    // Upload thumbnail
    const thumbnailFilename = `${baseName}-thumbnail-${Date.now()}.webp`
    const { data: thumbnailData, error: thumbnailError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(thumbnailFilename, buffers.thumbnail, {
        contentType: 'image/webp',
        cacheControl: '31536000' // 1 year cache
      })

    if (thumbnailError) {
      throw new Error(`Thumbnail upload failed: ${thumbnailError.message}`)
    }

    // Upload medium
    const mediumFilename = `${baseName}-medium-${Date.now()}.webp`
    const { data: mediumData, error: mediumError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(mediumFilename, buffers.medium, {
        contentType: 'image/webp',
        cacheControl: '31536000'
      })

    if (mediumError) {
      throw new Error(`Medium upload failed: ${mediumError.message}`)
    }

    // Upload large
    const largeFilename = `${baseName}-large-${Date.now()}.webp`
    const { data: largeData, error: largeError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(largeFilename, buffers.large, {
        contentType: 'image/webp',
        cacheControl: '31536000'
      })

    if (largeError) {
      throw new Error(`Large upload failed: ${largeError.message}`)
    }

    // Get public URLs
    const { data: { publicUrl: thumbnailUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(thumbnailData.path)

    const { data: { publicUrl: mediumUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(mediumData.path)

    const { data: { publicUrl: largeUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(largeData.path)

    return {
      thumbnail: thumbnailUrl,
      medium: mediumUrl,
      large: largeUrl
    }
  } catch (error) {
    console.error('Supabase Storage upload failed:', error)
    throw new Error('Failed to upload images to storage')
  }
}

/**
 * Deletes images from Supabase Storage
 */
export async function deleteImagesFromStorage(urls: string[]): Promise<void> {
  const bucket = 'media'
  
  try {
    // Extract file paths from URLs
    const filePaths = urls.map(url => {
      const urlParts = url.split('/')
      return urlParts[urlParts.length - 1] // Get filename from URL
    })

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(filePaths)

    if (error) {
      console.error('Failed to delete images from storage:', error)
      throw new Error(`Failed to delete images: ${error.message}`)
    }
  } catch (error) {
    console.error('Storage deletion failed:', error)
    throw error
  }
}

/**
 * Creates the media bucket if it doesn't exist
 * This should be run during setup
 */
export async function ensureMediaBucket(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const mediaBucket = buckets?.find(bucket => bucket.name === 'media')
    
    if (!mediaBucket) {
      // Create the bucket
      const { error: createError } = await supabaseAdmin.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        throw new Error(`Failed to create media bucket: ${createError.message}`)
      }

      console.log('Media bucket created successfully')
    }
  } catch (error) {
    console.error('Bucket setup failed:', error)
    throw error
  }
}

/**
 * Sets up public access policy for the media bucket
 */
export async function setupStoragePolicy(): Promise<void> {
  // Note: This would typically be done through the Supabase dashboard
  // or using the management API. For now, we'll log instructions.
  console.log(`
    Please set up the following RLS policy in your Supabase dashboard:
    
    Table: storage.objects
    Policy Name: "Public read access for media bucket"
    Policy: 
    CREATE POLICY "Public read access for media bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
    
    Also ensure the bucket is set to public in the Storage settings.
  `)
}