/**
 * Tests for POST /api/admin/navigation endpoint
 * Task 8.5: Create POST /api/admin/navigation endpoint
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/navigation/route'
import { prisma } from '@/lib/prisma'
import { generateCSRFToken } from '@/lib/csrf'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    navigation: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn().mockResolvedValue(null), // No auth error
}))

jest.mock('@/lib/csrf', () => ({
  requireCSRFToken: jest.fn().mockResolvedValue(null), // No CSRF error
}))

jest.mock('@/lib/audit-log', () => ({
  logAudit: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('POST /api/admin/navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a navigation item successfully', async () => {
    const mockNavItem = {
      id: 'nav-1',
      type: 'header',
      label: 'Home',
      url: '/',
      parentId: null,
      order: 0,
      createdAt: new Date(),
    }

    mockPrisma.navigation.create.mockResolvedValue(mockNavItem)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        type: 'header',
        label: 'Home',
        url: '/',
        order: 0,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({
      ...mockNavItem,
      createdAt: mockNavItem.createdAt.toISOString(),
    })
    expect(mockPrisma.navigation.create).toHaveBeenCalledWith({
      data: {
        type: 'header',
        label: 'Home',
        url: '/',
        parentId: undefined,
        order: 0,
      },
    })
  })

  it('should create a child navigation item with valid parent', async () => {
    const mockParent = {
      id: 'parent-1',
      parentId: null,
    }

    const mockChildItem = {
      id: 'nav-2',
      type: 'header',
      label: 'About Us',
      url: '/about',
      parentId: 'parent-1',
      order: 1,
      createdAt: new Date(),
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockParent)
    mockPrisma.navigation.create.mockResolvedValue(mockChildItem)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        type: 'header',
        label: 'About Us',
        url: '/about',
        parentId: 'parent-1',
        order: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({
      ...mockChildItem,
      createdAt: mockChildItem.createdAt.toISOString(),
    })
    expect(mockPrisma.navigation.findUnique).toHaveBeenCalledWith({
      where: { id: 'parent-1' },
    })
  })

  it('should reject creation when parent does not exist', async () => {
    mockPrisma.navigation.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        type: 'header',
        label: 'About Us',
        url: '/about',
        parentId: 'non-existent',
        order: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Ana öğe bulunamadı')
  })

  it('should reject creation when trying to create 3rd level (max depth exceeded)', async () => {
    const mockGrandparent = {
      id: 'grandparent-1',
      parentId: 'great-grandparent-1', // This parent already has a parent
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockGrandparent)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        type: 'header',
        label: 'Deep Item',
        url: '/deep',
        parentId: 'grandparent-1',
        order: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Maksimum 2 seviye desteklenebilir')
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        // Missing required fields
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz veri')
    expect(data.details).toBeDefined()
  })

  it('should validate navigation type enum', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        type: 'invalid-type',
        label: 'Test',
        url: '/test',
        order: 0,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz veri')
  })

  it('should validate URL format', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'valid-token',
      },
      body: JSON.stringify({
        type: 'header',
        label: 'Test',
        url: 'invalid-url', // Should start with /, http://, or https://
        order: 0,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Geçersiz veri')
  })
})