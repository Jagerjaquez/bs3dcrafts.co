/**
 * Tests for POST /api/admin/pages endpoint
 * 
 * Validates page creation with all required features:
 * - Admin authentication
 * - CSRF protection
 * - Input validation
 * - Slug auto-generation
 * - Slug uniqueness check
 * - HTML sanitization
 * - Audit logging
 */

import { POST } from '@/app/api/admin/pages/route'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { generateSlug } from '@/lib/slug'
import { sanitizeHTML } from '@/lib/sanitize'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    page: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/admin-auth')
jest.mock('@/lib/csrf')
jest.mock('@/lib/audit-log')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('POST /api/admin/pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should require admin authentication', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    )

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(requireAdminAuth).toHaveBeenCalledWith(mockRequest)
    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should require CSRF token', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403 })
    )

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(requireCSRFToken).toHaveBeenCalledWith(mockRequest)
    expect(response.status).toBe(403)
    expect(data.error).toBe('Invalid CSRF token')
  })

  it('should validate input with PageSchema', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: '', // Invalid: empty title
        slug: 'test',
        content: 'Test content',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz veri')
    expect(data.details).toBeDefined()
  })

  it('should auto-generate slug if not provided', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Page',
        content: 'Test content',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.create as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Test Page',
      slug: 'test-page',
      content: 'Test content',
      status: 'published',
    })

    const response = await POST(mockRequest as any)

    expect(response.status).toBe(201)
    expect(prisma.page.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'test-page',
        }),
      })
    )
  })

  it('should check slug uniqueness', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Page',
        slug: 'existing-slug',
        content: 'Test content',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      slug: 'existing-slug',
    })

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Bu slug zaten mevcut')
  })

  it('should sanitize HTML content', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Page',
        slug: 'test-page',
        content: '<p>Safe content</p><script>alert("xss")</script>',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.create as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Test Page',
      slug: 'test-page',
      content: '<p>Safe content</p>',
      status: 'published',
    })

    const response = await POST(mockRequest as any)

    expect(response.status).toBe(201)
    // Verify sanitizeHTML was called (content should not contain script tag)
    expect(prisma.page.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: expect.not.stringContaining('<script>'),
        }),
      })
    )
  })

  it('should create page record in database', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Page',
        slug: 'test-page',
        content: 'Test content',
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test meta description',
        keywords: 'test, page',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.create as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Test Page',
      slug: 'test-page',
      content: 'Test content',
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test meta description',
      keywords: 'test, page',
      status: 'published',
    })

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(prisma.page.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Page',
        slug: 'test-page',
        content: 'Test content',
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test meta description',
        keywords: 'test, page',
        status: 'published',
      },
    })
    expect(data.id).toBe('1')
  })

  it('should log admin action on success', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Page',
        slug: 'test-page',
        content: 'Test content',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.create as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Test Page',
      slug: 'test-page',
      content: 'Test content',
      status: 'published',
    })

    await POST(mockRequest as any)

    expect(logAudit).toHaveBeenCalledWith({
      action: 'page_created',
      userId: 'admin',
      success: true,
      details: { pageId: '1', pageTitle: 'Test Page' },
    })
  })

  it('should log admin action on failure', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Page',
        slug: 'test-page',
        content: 'Test content',
        status: 'published',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.create as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await POST(mockRequest as any)

    expect(response.status).toBe(500)
    expect(logAudit).toHaveBeenCalledWith({
      action: 'page_created',
      userId: 'admin',
      success: false,
      errorMessage: 'Database error',
    })
  })

  it('should accept all required fields', async () => {
    const mockRequest = new Request('http://localhost/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Complete Test Page',
        slug: 'complete-test-page',
        content: '<h1>Test Content</h1><p>This is a test.</p>',
        metaTitle: 'Complete Test Meta Title',
        metaDescription: 'This is a complete test meta description',
        keywords: 'test, complete, page',
        status: 'draft',
      }),
    })

    ;(requireAdminAuth as jest.Mock).mockResolvedValue(null)
    ;(requireCSRFToken as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.page.create as jest.Mock).mockResolvedValue({
      id: '2',
      title: 'Complete Test Page',
      slug: 'complete-test-page',
      content: '<h1>Test Content</h1><p>This is a test.</p>',
      metaTitle: 'Complete Test Meta Title',
      metaDescription: 'This is a complete test meta description',
      keywords: 'test, complete, page',
      status: 'draft',
    })

    const response = await POST(mockRequest as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({
      id: '2',
      title: 'Complete Test Page',
      slug: 'complete-test-page',
      metaTitle: 'Complete Test Meta Title',
      metaDescription: 'This is a complete test meta description',
      keywords: 'test, complete, page',
      status: 'draft',
    })
  })
})
