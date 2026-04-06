/**
 * Tests for DELETE /api/admin/navigation/:id endpoint
 * Task 8.7: Create DELETE /api/admin/navigation/:id endpoint
 */

import { NextRequest } from 'next/server'
import { DELETE } from '@/app/api/admin/navigation/[id]/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    navigation: {
      findUnique: jest.fn(),
      delete: jest.fn(),
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

describe('DELETE /api/admin/navigation/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete a navigation item without children successfully', async () => {
    const mockNavItem = {
      id: 'nav-1',
      type: 'header',
      label: 'Home',
      url: '/',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      children: [], // No children
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockNavItem)
    mockPrisma.navigation.delete.mockResolvedValue(mockNavItem)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Navigasyon öğesi silindi')
    expect(mockPrisma.navigation.findUnique).toHaveBeenCalledWith({
      where: { id: 'nav-1' },
      include: { children: true },
    })
    expect(mockPrisma.navigation.delete).toHaveBeenCalledWith({
      where: { id: 'nav-1' },
    })
  })

  it('should delete a navigation item with children (cascade delete)', async () => {
    const mockNavItem = {
      id: 'nav-1',
      type: 'header',
      label: 'Products',
      url: '/products',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      children: [
        { id: 'nav-2', label: 'Category 1' },
        { id: 'nav-3', label: 'Category 2' },
      ],
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockNavItem)
    mockPrisma.navigation.delete.mockResolvedValue(mockNavItem)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Navigasyon öğesi ve 2 alt öğesi silindi')
    expect(mockPrisma.navigation.findUnique).toHaveBeenCalledWith({
      where: { id: 'nav-1' },
      include: { children: true },
    })
    expect(mockPrisma.navigation.delete).toHaveBeenCalledWith({
      where: { id: 'nav-1' },
    })
  })

  it('should return 404 when navigation item does not exist', async () => {
    mockPrisma.navigation.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/non-existent', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Öğe bulunamadı')
    expect(mockPrisma.navigation.delete).not.toHaveBeenCalled()
  })

  it('should require admin authentication', async () => {
    const { requireAdminAuth } = require('@/lib/admin-auth')
    requireAdminAuth.mockResolvedValueOnce({
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    })

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })

    expect(response.status).toBe(401)
    expect(mockPrisma.navigation.findUnique).not.toHaveBeenCalled()
  })

  it('should require CSRF token', async () => {
    const { requireCSRFToken } = require('@/lib/csrf')
    requireCSRFToken.mockResolvedValueOnce({
      status: 403,
      json: () => Promise.resolve({ error: 'Invalid CSRF token' }),
    })

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })

    expect(response.status).toBe(403)
    expect(mockPrisma.navigation.findUnique).not.toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    const mockNavItem = {
      id: 'nav-1',
      type: 'header',
      label: 'Home',
      url: '/',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      children: [],
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockNavItem)
    mockPrisma.navigation.delete.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    const response = await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Navigasyon silinemedi')
  })

  it('should log audit trail with children count', async () => {
    const { logAudit } = require('@/lib/audit-log')
    const mockNavItem = {
      id: 'nav-1',
      type: 'header',
      label: 'Products',
      url: '/products',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      children: [
        { id: 'nav-2', label: 'Category 1' },
        { id: 'nav-3', label: 'Category 2' },
      ],
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockNavItem)
    mockPrisma.navigation.delete.mockResolvedValue(mockNavItem)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })

    expect(logAudit).toHaveBeenCalledWith({
      action: 'navigation_deleted',
      userId: 'admin',
      success: true,
      details: {
        navigationId: 'nav-1',
        label: 'Products',
        childrenDeleted: 2,
      },
    })
  })

  it('should invalidate cache after deletion', async () => {
    const { revalidatePath } = require('next/cache')
    const mockNavItem = {
      id: 'nav-1',
      type: 'header',
      label: 'Home',
      url: '/',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      children: [],
    }

    mockPrisma.navigation.findUnique.mockResolvedValue(mockNavItem)
    mockPrisma.navigation.delete.mockResolvedValue(mockNavItem)

    const request = new NextRequest('http://localhost:3000/api/admin/navigation/nav-1', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': 'valid-token',
      },
    })

    await DELETE(request, { params: Promise.resolve({ id: 'nav-1' }) })

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})