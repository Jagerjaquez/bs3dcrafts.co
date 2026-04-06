import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { uploadMedia, getMediaList } from '@/lib/media-manager'
import { logAdminAction } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  try {
    const csrfError = await requireCSRFToken(request)
    if (csrfError) {
      return csrfError
    }

    const authError = await requireAdminAuth(request)
    if (authError) {
      return authError
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadMedia(file, buffer)

    await logAdminAction('media_uploaded', 'admin', request, {
      mediaId: result.id,
      filename: result.filename,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Media upload error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to upload media'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) {
      return authError
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const type = searchParams.get('type') || undefined
    const sortBy =
      (searchParams.get('sortBy') as 'uploadedAt' | 'filename' | 'size') ||
      'uploadedAt'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const result = await getMediaList({
      page,
      limit,
      search,
      type,
      sortBy,
      sortOrder,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Media list error:', error)
    return NextResponse.json({ error: 'Failed to fetch media list' }, { status: 500 })
  }
}
