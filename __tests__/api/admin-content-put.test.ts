/**
 * Admin Content PUT API Tests
 * 
 * Tests for PUT /api/admin/content/:key endpoint
 * Requirements: 10.6, 10.7
 */

import { PUT } from '@/app/api/admin/content/[key]/route'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    siteContent: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn(),
}))

jest.mock('@/lib/csrf', () => ({
  requireCSRFToken: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const prisma = new PrismaClient()
const { requireAdminAuth } = require('@/lib/admin-auth')
const { requireCSRFToken } = require('@/lib/csrf')

describe('PUT /api/admin/content/:key - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: auth and CSRF pass
    requireAdminAuth.mockResolvedValue(null)
    requireCSRFToken.mockResolvedValue(null)
  })

  describe('Authentication and Authorization', () => {
    it('should require admin authentication', async () => {
      const authError = new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
      requireAdminAuth.mockResolvedValue(authError)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'Updated Title' },
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      expect(response.status).toBe(401)
      expect(requireAdminAuth).toHaveBeenCalledWith(request)
    })

    it('should require CSRF token', async () => {
      const csrfError = new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403 }
      )
      requireCSRFToken.mockResolvedValue(csrfError)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'Updated Title' },
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      expect(response.status).toBe(403)
      expect(requireCSRFToken).toHaveBeenCalledWith(request)
    })
  })

  describe('Input Validation', () => {
    it('should validate value field is present', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
      expect(data.details).toBeDefined()
    })

    it('should validate value is an object', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: 'not an object',
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
    })

    it('should return 404 if content does not exist', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/content/nonexistent.key', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'Test' },
        }),
      })

      const response = await PUT(request, { params: { key: 'nonexistent.key' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('İçerik bulunamadı')
    })
  })

  describe('Content Update', () => {
    it('should update content successfully with valid data', async () => {
      const existingContent = {
        id: 'content_123',
        key: 'homepage.hero',
        value: {
          title: 'Old Title',
          description: 'Old Description',
        },
        section: 'homepage',
        updatedAt: new Date('2024-01-01'),
      }

      const updatedContent = {
        ...existingContent,
        value: {
          title: 'New Title',
          description: 'New Description',
          buttonText: 'Shop Now',
          buttonUrl: '/products',
        },
        updatedAt: new Date('2024-01-02'),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: {
            title: 'New Title',
            description: 'New Description',
            buttonText: 'Shop Now',
            buttonUrl: '/products',
          },
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.key).toBe('homepage.hero')
      expect(data.value.title).toBe('New Title')
      expect(data.value.description).toBe('New Description')
      expect(prisma.siteContent.update).toHaveBeenCalledWith({
        where: { key: 'homepage.hero' },
        data: {
          value: {
            title: 'New Title',
            description: 'New Description',
            buttonText: 'Shop Now',
            buttonUrl: '/products',
          },
        },
      })
    })

    it('should handle complex JSON values', async () => {
      const existingContent = {
        id: 'content_carousel',
        key: 'homepage.carousel',
        value: { items: [] },
        section: 'homepage',
        updatedAt: new Date(),
      }

      const complexValue = {
        items: [
          { id: '1', title: 'Item 1', order: 1 },
          { id: '2', title: 'Item 2', order: 2 },
        ],
        settings: {
          enabled: true,
          maxItems: 10,
        },
      }

      const updatedContent = {
        ...existingContent,
        value: complexValue,
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.carousel', {
        method: 'PUT',
        body: JSON.stringify({
          value: complexValue,
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.carousel' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.value).toEqual(complexValue)
    })

    it('should update partial content fields', async () => {
      const existingContent = {
        id: 'content_hero',
        key: 'homepage.hero',
        value: {
          title: 'Old Title',
          description: 'Old Description',
          buttonText: 'Old Button',
          buttonUrl: '/old',
        },
        section: 'homepage',
        updatedAt: new Date(),
      }

      const updatedContent = {
        ...existingContent,
        value: {
          title: 'New Title',
        },
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: {
            title: 'New Title',
          },
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.value.title).toBe('New Title')
    })
  })

  describe('Audit Logging', () => {
    it('should log successful content update', async () => {
      const existingContent = {
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Old' },
        section: 'test',
        updatedAt: new Date(),
      }

      const updatedContent = {
        ...existingContent,
        value: { title: 'New' },
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'New' },
        }),
      })

      await PUT(request, { params: { key: 'test.key' } })

      expect(prisma.auditLog.create).toHaveBeenCalled()
    })

    it('should log failed content update', async () => {
      const existingContent = {
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Old' },
        section: 'test',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'New' },
        }),
      })

      const response = await PUT(request, { params: { key: 'test.key' } })

      expect(response.status).toBe(500)
      expect(prisma.auditLog.create).toHaveBeenCalled()
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache after update', async () => {
      const { revalidatePath } = require('next/cache')
      
      const existingContent = {
        id: 'content_123',
        key: 'homepage.hero',
        value: { title: 'Old' },
        section: 'homepage',
        updatedAt: new Date(),
      }

      const updatedContent = {
        ...existingContent,
        value: { title: 'New' },
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'New' },
        }),
      })

      await PUT(request, { params: { key: 'homepage.hero' } })

      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/api/content/homepage')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      )

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'PUT',
        body: JSON.stringify({
          value: { title: 'Test' },
        }),
      })

      const response = await PUT(request, { params: { key: 'test.key' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('İçerik güncellenemedi')
    })

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'PUT',
        body: 'invalid json',
      })

      const response = await PUT(request, { params: { key: 'test.key' } })
      expect(response.status).toBe(500)
    })
  })

  describe('Different Content Sections', () => {
    it('should update hero section content', async () => {
      const existingContent = {
        id: 'content_hero',
        key: 'homepage.hero',
        value: {
          title: 'Old',
          description: 'Old',
        },
        section: 'homepage',
        updatedAt: new Date(),
      }

      const updatedContent = {
        ...existingContent,
        value: {
          title: 'Welcome',
          description: 'Description',
          buttonText: 'Click',
          buttonUrl: '/link',
          backgroundImage: 'https://example.com/image.jpg',
        },
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'PUT',
        body: JSON.stringify({
          value: updatedContent.value,
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.hero' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.section).toBe('homepage')
    })

    it('should update testimonials section content', async () => {
      const existingContent = {
        id: 'content_testimonials',
        key: 'homepage.testimonials',
        value: { items: [] },
        section: 'homepage',
        updatedAt: new Date(),
      }

      const updatedContent = {
        ...existingContent,
        value: {
          items: [
            {
              id: '1',
              name: 'John Doe',
              role: 'Customer',
              comment: 'Great service!',
              rating: 5,
            },
          ],
        },
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.update as jest.Mock).mockResolvedValue(updatedContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.testimonials', {
        method: 'PUT',
        body: JSON.stringify({
          value: updatedContent.value,
        }),
      })

      const response = await PUT(request, { params: { key: 'homepage.testimonials' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.value.items).toHaveLength(1)
    })
  })
})
