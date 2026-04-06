/**
 * Admin Settings API Tests
 * 
 * Tests for /api/admin/settings endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, PUT, POST } from '@/app/api/admin/settings/route'
import { POST as ResetPOST } from '@/app/api/admin/settings/reset/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn().mockResolvedValue(null), // Authenticated
}))

jest.mock('@/lib/csrf', () => ({
  requireCSRFToken: jest.fn().mockResolvedValue(null), // Valid CSRF
}))

jest.mock('@/lib/audit-log', () => ({
  logAudit: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    settings: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}))

describe('/api/admin/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/settings', () => {
    it('should return settings grouped by category', async () => {
      const mockSettings = [
        { key: 'site_title', value: 'BS3DCrafts', category: 'general' },
        { key: 'contact_email', value: 'test@example.com', category: 'contact' },
        { key: 'social_instagram', value: 'https://instagram.com/test', category: 'social' },
      ]

      jest.mocked(prisma.settings.findMany).mockResolvedValue(mockSettings)

      const request = new NextRequest('http://localhost/api/admin/settings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        general: { site_title: 'BS3DCrafts' },
        contact: { contact_email: 'test@example.com' },
        social: { social_instagram: 'https://instagram.com/test' },
      })
    })

    it('should handle empty settings', async () => {
      jest.mocked(prisma.settings.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/admin/settings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({})
    })

    it('should handle database errors', async () => {
      jest.mocked(prisma.settings.findMany).mockRejectedValue(new Error('DB Error'))

      const request = new NextRequest('http://localhost/api/admin/settings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Ayarlar getirilemedi')
    })
  })

  describe('PUT /api/admin/settings', () => {
    it('should update multiple settings', async () => {
      const updateData = {
        site_title: 'New Title',
        contact_email: 'new@example.com',
        category: 'general',
      }

      jest.mocked(prisma.settings.upsert).mockResolvedValue({
        id: '1',
        key: 'site_title',
        value: 'New Title',
        category: 'general',
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Ayarlar başarıyla güncellendi')
      expect(prisma.settings.upsert).toHaveBeenCalledTimes(2) // site_title and contact_email
    })

    it('should validate URL fields', async () => {
      const updateData = {
        social_instagram: 'invalid-url',
        category: 'social',
      }

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('geçerli bir URL değil')
    })

    it('should validate email fields', async () => {
      const updateData = {
        contact_email: 'invalid-email',
        category: 'contact',
      }

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('geçerli bir email değil')
    })

    it('should allow empty values for optional fields', async () => {
      const updateData = {
        social_instagram: '',
        contact_email: '',
        category: 'general',
      }

      jest.mocked(prisma.settings.upsert).mockResolvedValue({
        id: '1',
        key: 'social_instagram',
        value: '',
        category: 'general',
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Ayarlar başarıyla güncellendi')
    })
  })

  describe('POST /api/admin/settings/reset', () => {
    it('should reset setting to default value', async () => {
      const resetData = {
        key: 'site_title',
        category: 'general',
      }

      jest.mocked(prisma.settings.upsert).mockResolvedValue({
        id: '1',
        key: 'site_title',
        value: 'BS3DCrafts',
        category: 'general',
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/admin/settings/reset', {
        method: 'POST',
        body: JSON.stringify(resetData),
      })

      const response = await ResetPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('site_title varsayılan değere sıfırlandı')
      expect(prisma.settings.upsert).toHaveBeenCalledWith({
        where: { key: 'site_title' },
        update: { value: 'BS3DCrafts' },
        create: { key: 'site_title', value: 'BS3DCrafts', category: 'general' },
      })
    })

    it('should require key and category', async () => {
      const resetData = { key: 'site_title' } // Missing category

      const request = new NextRequest('http://localhost/api/admin/settings/reset', {
        method: 'POST',
        body: JSON.stringify(resetData),
      })

      const response = await ResetPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Anahtar ve kategori gerekli')
    })

    it('should handle unknown settings', async () => {
      const resetData = {
        key: 'unknown_setting',
        category: 'general',
      }

      const request = new NextRequest('http://localhost/api/admin/settings/reset', {
        method: 'POST',
        body: JSON.stringify(resetData),
      })

      const response = await ResetPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Bu ayar için varsayılan değer bulunamadı')
    })
  })

  describe('Authentication and Authorization', () => {
    it('should require admin authentication for GET', async () => {
      const { requireAdminAuth } = await import('@/lib/admin-auth')
      jest.mocked(requireAdminAuth).mockResolvedValue(
        new Response('Unauthorized', { status: 401 })
      )

      const request = new NextRequest('http://localhost/api/admin/settings')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should require admin authentication and CSRF for PUT', async () => {
      const { requireCSRFToken } = await import('@/lib/csrf')
      jest.mocked(requireCSRFToken).mockResolvedValue(
        new Response('CSRF Error', { status: 403 })
      )

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ site_title: 'Test' }),
      })

      const response = await PUT(request)
      expect(response.status).toBe(403)
    })
  })

  describe('Audit Logging', () => {
    it('should log successful settings updates', async () => {
      const { logAudit } = await import('@/lib/audit-log')
      
      const updateData = {
        site_title: 'New Title',
        category: 'general',
      }

      jest.mocked(prisma.settings.upsert).mockResolvedValue({
        id: '1',
        key: 'site_title',
        value: 'New Title',
        category: 'general',
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      await PUT(request)

      expect(logAudit).toHaveBeenCalledWith({
        action: 'settings_changed',
        userId: 'admin',
        success: true,
        details: { category: 'general', updatedCount: 1 },
      })
    })

    it('should log failed settings updates', async () => {
      const { logAudit } = await import('@/lib/audit-log')
      
      jest.mocked(prisma.settings.upsert).mockRejectedValue(new Error('DB Error'))

      const updateData = {
        site_title: 'New Title',
        category: 'general',
      }

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      await PUT(request)

      expect(logAudit).toHaveBeenCalledWith({
        action: 'settings_changed',
        userId: 'admin',
        success: false,
        errorMessage: 'DB Error',
      })
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache after settings update', async () => {
      const { revalidatePath } = await import('next/cache')
      
      const updateData = {
        site_title: 'New Title',
        category: 'general',
      }

      jest.mocked(prisma.settings.upsert).mockResolvedValue({
        id: '1',
        key: 'site_title',
        value: 'New Title',
        category: 'general',
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      await PUT(request)

      expect(revalidatePath).toHaveBeenCalledWith('/api/content/settings')
    })

    it('should invalidate cache after settings reset', async () => {
      const { revalidatePath } = await import('next/cache')
      
      const resetData = {
        key: 'site_title',
        category: 'general',
      }

      jest.mocked(prisma.settings.upsert).mockResolvedValue({
        id: '1',
        key: 'site_title',
        value: 'BS3DCrafts',
        category: 'general',
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost/api/admin/settings/reset', {
        method: 'POST',
        body: JSON.stringify(resetData),
      })

      await ResetPOST(request)

      expect(revalidatePath).toHaveBeenCalledWith('/api/content/settings')
    })
  })
})