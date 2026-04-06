/**
 * Admin Content POST API Tests
 * 
 * Tests for POST /api/admin/content endpoint
 * Requirements: 10.6, 10.7
 */

import { POST } from '@/app/api/admin/content/route'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    siteContent: {
      findUnique: jest.fn(),
      create: jest.fn(),
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

describe('POST /api/admin/content - Unit Tests', () => {
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

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: { title: 'Test' },
          section: 'test',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
      expect(requireAdminAuth).toHaveBeenCalledWith(request)
    })

    it('should require CSRF token', async () => {
      const csrfError = new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403 }
      )
      requireCSRFToken.mockResolvedValue(csrfError)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: { title: 'Test' },
          section: 'test',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      expect(requireCSRFToken).toHaveBeenCalledWith(request)
    })
  })

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
      expect(data.details).toBeDefined()
    })

    it('should validate key field', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: '',
          value: { title: 'Test' },
          section: 'test',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
    })

    it('should validate value is an object', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: 'not an object',
          section: 'test',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
    })

    it('should validate section field', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: { title: 'Test' },
          section: '',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
    })
  })

  describe('Content Creation', () => {
    it('should create content successfully with valid data', async () => {
      const mockContent = {
        id: 'content_123',
        key: 'homepage.hero',
        value: {
          title: 'Welcome to BS3DCrafts',
          description: 'Precision in Every Layer',
          buttonText: 'Shop Now',
          buttonUrl: '/products',
        },
        section: 'homepage',
        updatedAt: new Date('2024-01-01'),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(mockContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'homepage.hero',
          value: {
            title: 'Welcome to BS3DCrafts',
            description: 'Precision in Every Layer',
            buttonText: 'Shop Now',
            buttonUrl: '/products',
          },
          section: 'homepage',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('content_123')
      expect(data.key).toBe('homepage.hero')
      expect(data.value).toEqual({
        title: 'Welcome to BS3DCrafts',
        description: 'Precision in Every Layer',
        buttonText: 'Shop Now',
        buttonUrl: '/products',
      })
      expect(data.section).toBe('homepage')
    })

    it('should reject duplicate keys', async () => {
      const existingContent = {
        id: 'content_existing',
        key: 'homepage.hero',
        value: { title: 'Existing' },
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'homepage.hero',
          value: { title: 'New' },
          section: 'homepage',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Bu anahtar zaten mevcut')
    })

    it('should handle complex JSON values', async () => {
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

      const mockContent = {
        id: 'content_complex',
        key: 'homepage.carousel',
        value: complexValue,
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(mockContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'homepage.carousel',
          value: complexValue,
          section: 'homepage',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.value).toEqual(complexValue)
    })
  })

  describe('Audit Logging', () => {
    it('should log successful content creation', async () => {
      const mockContent = {
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Test' },
        section: 'test',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(mockContent)
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: { title: 'Test' },
          section: 'test',
        }),
      })

      await POST(request)

      // Audit log should be called (async, so we just verify it was called)
      expect(prisma.auditLog.create).toHaveBeenCalled()
    })

    it('should log failed content creation', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: { title: 'Test' },
          section: 'test',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      expect(prisma.auditLog.create).toHaveBeenCalled()
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate homepage cache after creation', async () => {
      const { revalidatePath } = require('next/cache')
      
      const mockContent = {
        id: 'content_123',
        key: 'homepage.hero',
        value: { title: 'Test' },
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(mockContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'homepage.hero',
          value: { title: 'Test' },
          section: 'homepage',
        }),
      })

      await POST(request)

      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/api/content/homepage')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      )

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test.key',
          value: { title: 'Test' },
          section: 'test',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('İçerik oluşturulamadı')
    })

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })

  describe('Different Content Sections', () => {
    it('should create hero section content', async () => {
      const heroContent = {
        id: 'content_hero',
        key: 'homepage.hero',
        value: {
          title: 'Welcome',
          description: 'Description',
          buttonText: 'Click',
          buttonUrl: '/link',
          backgroundImage: 'https://example.com/image.jpg',
        },
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(heroContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'homepage.hero',
          value: heroContent.value,
          section: 'homepage',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.section).toBe('homepage')
    })

    it('should create testimonials section content', async () => {
      const testimonialsContent = {
        id: 'content_testimonials',
        key: 'homepage.testimonials',
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
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(testimonialsContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'homepage.testimonials',
          value: testimonialsContent.value,
          section: 'homepage',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.value.items).toHaveLength(1)
    })

    it('should create settings section content', async () => {
      const settingsContent = {
        id: 'content_settings',
        key: 'site.settings',
        value: {
          title: 'BS3DCrafts',
          tagline: 'Precision in Every Layer',
          contactEmail: 'info@bs3dcrafts.com',
        },
        section: 'settings',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.siteContent.create as jest.Mock).mockResolvedValue(settingsContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: 'site.settings',
          value: settingsContent.value,
          section: 'settings',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.section).toBe('settings')
    })
  })
})
