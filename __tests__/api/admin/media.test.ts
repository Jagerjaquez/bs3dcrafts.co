import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/admin/media/route'
import { DELETE } from '@/app/api/admin/media/[id]/route'

// Mock the dependencies
jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn().mockResolvedValue(null)
}))

jest.mock('@/lib/csrf', () => ({
  requireCSRFToken: jest.fn().mockResolvedValue(null)
}))

jest.mock('@/lib/media-manager', () => ({
  uploadMedia: jest.fn(),
  getMediaList: jest.fn(),
  deleteMedia: jest.fn(),
  getMediaById: jest.fn()
}))

jest.mock('@/lib/audit-log', () => ({
  logAdminAction: jest.fn()
}))

describe('/api/admin/media', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/admin/media', () => {
    it('should reject request without file', async () => {
      const formData = new FormData()
      
      const request = new NextRequest('http://localhost:3000/api/admin/media', {
        method: 'POST',
        body: formData,
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No file provided')
    })

    it('should handle file upload successfully', async () => {
      const { uploadMedia } = require('@/lib/media-manager')
      
      uploadMedia.mockResolvedValue({
        id: 'media123',
        filename: 'test.jpg',
        urls: {
          thumbnail: 'https://example.com/thumb.webp',
          medium: 'https://example.com/medium.webp',
          large: 'https://example.com/large.webp'
        },
        size: 1024,
        dimensions: '800x600',
        type: 'image'
      })

      // Create a mock file
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)

      const request = new NextRequest('http://localhost:3000/api/admin/media', {
        method: 'POST',
        body: formData,
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('media123')
      expect(uploadMedia).toHaveBeenCalled()
    })
  })

  describe('GET /api/admin/media', () => {
    it('should return media list with pagination', async () => {
      const { getMediaList } = require('@/lib/media-manager')
      
      getMediaList.mockResolvedValue({
        media: [
          {
            id: 'media1',
            filename: 'test1.jpg',
            url: 'https://example.com/test1.webp',
            type: 'image',
            size: 1024,
            dimensions: '800x600',
            usageCount: 0,
            uploadedAt: new Date()
          }
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1
      })

      const request = new NextRequest('http://localhost:3000/api/admin/media?page=1&limit=20', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.media).toHaveLength(1)
      expect(data.data.total).toBe(1)
    })

    it('should validate pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/media?page=0&limit=200', {
        method: 'GET',
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid pagination parameters')
    })
  })

  describe('DELETE /api/admin/media/:id', () => {
    it('should delete media successfully', async () => {
      const { deleteMedia, getMediaById } = require('@/lib/media-manager')
      
      getMediaById.mockResolvedValue({
        id: 'media123',
        filename: 'test.jpg',
        url: 'https://example.com/test.webp',
        type: 'image',
        size: 1024,
        dimensions: '800x600',
        usageCount: 0,
        uploadedAt: new Date()
      })

      deleteMedia.mockResolvedValue({
        success: true,
        message: 'Media deleted successfully'
      })

      const request = new NextRequest('http://localhost:3000/api/admin/media/media123', {
        method: 'DELETE',
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await DELETE(request, { params: { id: 'media123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Media deleted successfully')
    })

    it('should return warning when media is in use', async () => {
      const { deleteMedia, getMediaById } = require('@/lib/media-manager')
      
      getMediaById.mockResolvedValue({
        id: 'media123',
        filename: 'test.jpg',
        url: 'https://example.com/test.webp',
        type: 'image',
        size: 1024,
        dimensions: '800x600',
        usageCount: 2,
        uploadedAt: new Date()
      })

      deleteMedia.mockResolvedValue({
        success: false,
        message: 'Media is currently in use in 2 location(s)',
        usageDetails: [
          { type: 'product', name: 'Test Product', url: '/admin/products/prod123' }
        ]
      })

      const request = new NextRequest('http://localhost:3000/api/admin/media/media123', {
        method: 'DELETE',
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await DELETE(request, { params: { id: 'media123' } })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.warning).toBe(true)
      expect(data.usageDetails).toBeDefined()
    })

    it('should return 404 for non-existent media', async () => {
      const { getMediaById } = require('@/lib/media-manager')
      
      getMediaById.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/media/nonexistent', {
        method: 'DELETE',
        headers: {
          'x-admin-id': 'admin123'
        }
      })

      const response = await DELETE(request, { params: { id: 'nonexistent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Media not found')
    })
  })
})