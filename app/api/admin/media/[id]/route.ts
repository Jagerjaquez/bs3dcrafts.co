import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { deleteMedia, getMediaById } from '@/lib/media-manager'
import { logAdminAction } from '@/lib/audit-log'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = await requireCSRFToken(request)
    if (csrfError) {
      return csrfError
    }

    const authError = await requireAdminAuth(request)
    if (authError) {
      return authError
    }

    const { id: mediaId } = await params

    const media = await getMediaById(mediaId)
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const result = await deleteMedia(mediaId)

    if (!result.success) {
      if (result.usageDetails) {
        return NextResponse.json(
          {
            success: false,
            error: result.message,
            usageDetails: result.usageDetails,
            warning: true,
          },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    await logAdminAction('media_deleted', 'admin', request, {
      mediaId,
      filename: media.filename,
    })

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('Media deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) {
      return authError
    }

    const { id: mediaId } = await params
    const media = await getMediaById(mediaId)

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: media,
    })
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
