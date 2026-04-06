/**
 * Admin Content DELETE API Tests
 * 
 * Tests for DELETE /api/admin/content/:key endpoint
 * Requirements: 10.6, 10.7
 * Task: 5.3
 */

import { DELETE } from '@/app/api/admin/content/[key]/route'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    siteContent: {
      findUnique: jest.fn(),
      delete: jest.fn(),
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

describe('DELETE /api/admin/content/:key - Unit Tests', () => {
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

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'test.key' } })
      expect(response.status).toBe(401)
      expect(requireAdminAuth).toHaveBeenCalledWith(request)
    })

    it('should require CSRF token', async () => {
      const csrfError = new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403 }
      )
      requireCSRFToken.mockResolvedValue(csrfError)

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'test.key' } })
      expect(response.status).toBe(403)
      expect(requireCSRFToken).toHaveBeenCalledWith(request)
    })
  })

  describe('Input Validation', () => {
    it('should validate key parameter is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/content/', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: '' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Anahtar parametresi gerekli')
    })
  })

  describe('Content Deletion', () => {
    it('should delete content successfully when it exists', async () => {
      const existingContent = {
        id: 'content_123',
        key: 'homepage.hero',
        value: { title: 'Test' },
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.delete as jest.Mock).mockResolvedValue(existingContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'homepage.hero' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Başarıyla silindi')
      expect(prisma.siteContent.delete).toHaveBeenCalledWith({
        where: { key: 'homepage.hero' },
      })
    })

    it('should return 404 when content does not exist', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/admin/content/nonexistent.key', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'nonexistent.key' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('İçerik bulunamadı')
      expect(prisma.siteContent.delete).not.toHaveBeenCalled()
    })

    it('should delete different content sections', async () => {
      const sections = [
        { key: 'homepage.hero', section: 'homepage' },
        { key: 'homepage.testimonials', section: 'homepage' },
        { key: 'site.settings', section: 'settings' },
        { key: 'footer.links', section: 'footer' },
      ]

      for (const { key, section } of sections) {
        const content = {
          id: `content_${key}`,
          key,
          value: { test: 'data' },
          section,
          updatedAt: new Date(),
        }

        ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(content)
        ;(prisma.siteContent.delete as jest.Mock).mockResolvedValue(content)

        const request = new NextRequest(`http://localhost:3000/api/admin/content/${key}`, {
          method: 'DELETE',
        })

        const response = await DELETE(request, { params: { key } })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe('Başarıyla silindi')
      }
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache after deletion', async () => {
      const { revalidatePath } = require('next/cache')
      
      const existingContent = {
        id: 'content_123',
        key: 'homepage.hero',
        value: { title: 'Test' },
        section: 'homepage',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.delete as jest.Mock).mockResolvedValue(existingContent)

      const request = new NextRequest('http://localhost:3000/api/admin/content/homepage.hero', {
        method: 'DELETE',
      })

      await DELETE(request, { params: { key: 'homepage.hero' } })

      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/api/content/homepage')
    })
  })

  describe('Audit Logging', () => {
    it('should log successful content deletion', async () => {
      const existingContent = {
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Test' },
        section: 'test',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.delete as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      await DELETE(request, { params: { key: 'test.key' } })

      // Audit log should be called (async, so we just verify it was called)
      expect(prisma.auditLog.create).toHaveBeenCalled()
    })

    it('should log failed content deletion', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue({
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Test' },
        section: 'test',
        updatedAt: new Date(),
      })
      ;(prisma.siteContent.delete as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )
      ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'test.key' } })

      expect(response.status).toBe(500)
      expect(prisma.auditLog.create).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(prisma.siteContent.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      )

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'test.key' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('İçerik silinemedi')
    })

    it('should handle deletion errors gracefully', async () => {
      const existingContent = {
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Test' },
        section: 'test',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(existingContent)
      ;(prisma.siteContent.delete as jest.Mock).mockRejectedValue(
        new Error('Foreign key constraint violation')
      )

      const request = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { key: 'test.key' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('İçerik silinemedi')
    })
  })

  describe('Edge Cases', () => {
    it('should handle keys with special characters', async () => {
      const specialKeys = [
        'homepage.hero-section',
        'site.settings_general',
        'footer.social-media.links',
      ]

      for (const key of specialKeys) {
        const content = {
          id: `content_${key}`,
          key,
          value: { test: 'data' },
          section: 'test',
          updatedAt: new Date(),
        }

        ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(content)
        ;(prisma.siteContent.delete as jest.Mock).mockResolvedValue(content)

        const request = new NextRequest(`http://localhost:3000/api/admin/content/${key}`, {
          method: 'DELETE',
        })

        const response = await DELETE(request, { params: { key } })
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.message).toBe('Başarıyla silindi')
      }
    })

    it('should handle concurrent deletion attempts', async () => {
      const content = {
        id: 'content_123',
        key: 'test.key',
        value: { title: 'Test' },
        section: 'test',
        updatedAt: new Date(),
      }

      ;(prisma.siteContent.findUnique as jest.Mock).mockResolvedValue(content)
      ;(prisma.siteContent.delete as jest.Mock).mockResolvedValue(content)

      const request1 = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })
      const request2 = new NextRequest('http://localhost:3000/api/admin/content/test.key', {
        method: 'DELETE',
      })

      const [response1, response2] = await Promise.all([
        DELETE(request1, { params: { key: 'test.key' } }),
        DELETE(request2, { params: { key: 'test.key' } }),
      ])

      // Both should succeed (idempotent operation)
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    })
  })
})
