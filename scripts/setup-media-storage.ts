#!/usr/bin/env tsx

/**
 * Setup script for Supabase Storage media bucket
 * Run this script to ensure the media bucket exists and is properly configured
 */

import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

// Verify environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.error('\nPlease check your .env file')
  process.exit(1)
}

// Create Supabase client for this script
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function ensureMediaBucket(): Promise<void> {
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

      console.log('✅ Media bucket created successfully')
    } else {
      console.log('✅ Media bucket already exists')
    }
  } catch (error) {
    console.error('Bucket setup failed:', error)
    throw error
  }
}

function setupStoragePolicy(): void {
  console.log(`
📋 Storage Policy Setup Instructions:

Please set up the following RLS policy in your Supabase dashboard:

1. Go to your Supabase dashboard
2. Navigate to Storage > Policies
3. Create a new policy with these settings:

   Policy Name: "Public read access for media bucket"
   Table: storage.objects
   Operation: SELECT
   Policy Definition:
   
   CREATE POLICY "Public read access for media bucket" ON storage.objects
   FOR SELECT USING (bucket_id = 'media');

4. Also ensure the "media" bucket is set to public in Storage settings
  `)
}

async function setupMediaStorage() {
  console.log('🚀 Setting up Supabase Storage for media files...')
  
  try {
    // Ensure the media bucket exists
    await ensureMediaBucket()
    
    // Show policy setup instructions
    setupStoragePolicy()
    
    console.log('\n🎉 Media storage setup completed!')
    console.log('\nNext steps:')
    console.log('1. Follow the policy setup instructions above')
    console.log('2. Test media upload through the admin panel')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupMediaStorage()