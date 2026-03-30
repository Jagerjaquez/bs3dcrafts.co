import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_3D_TYPES = ['model/stl', 'model/obj', 'application/sla']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_3D_TYPES]

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const isAuth = await isAdminAuthenticated()
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Admin girişi gerekli.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya tipi. Sadece resim ve 3D model dosyaları yüklenebilir.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Dosya boyutu çok büyük. Maksimum ${MAX_FILE_SIZE / 1024 / 1024}MB olmalıdır.` },
        { status: 400 }
      )
    }

    // Sanitize filename - remove dangerous characters
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileExt = originalName.split('.').pop()?.toLowerCase()
    
    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'stl', 'obj']
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya uzantısı.' },
        { status: 400 }
      )
    }

    // Generate secure filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: 'Dosya yüklenemedi: ' + error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(fileName)

    return NextResponse.json({ 
      url: publicUrl,
      path: fileName 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
