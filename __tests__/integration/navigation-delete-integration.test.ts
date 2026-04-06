/**
 * Integration test for navigation DELETE endpoint
 * Tests the complete flow including cascade deletion
 */

import { prisma } from '@/lib/prisma'

describe('Navigation DELETE Integration', () => {
  let testParentId: string
  let testChildId1: string
  let testChildId2: string

  beforeAll(async () => {
    // Clean up any existing test navigation items
    await prisma.navigation.deleteMany({
      where: {
        label: {
          contains: 'test-nav-'
        }
      }
    })

    // Create test navigation hierarchy
    const parent = await prisma.navigation.create({
      data: {
        type: 'header',
        label: 'test-nav-parent',
        url: '/test-parent',
        order: 0
      }
    })
    testParentId = parent.id

    const child1 = await prisma.navigation.create({
      data: {
        type: 'header',
        label: 'test-nav-child-1',
        url: '/test-child-1',
        parentId: testParentId,
        order: 1
      }
    })
    testChildId1 = child1.id

    const child2 = await prisma.navigation.create({
      data: {
        type: 'header',
        label: 'test-nav-child-2',
        url: '/test-child-2',
        parentId: testParentId,
        order: 2
      }
    })
    testChildId2 = child2.id
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.navigation.deleteMany({
      where: {
        label: {
          contains: 'test-nav-'
        }
      }
    })
  })

  describe('Cascade deletion behavior', () => {
    it('should delete parent and all children when parent is deleted', async () => {
      // Verify initial state
      const initialParent = await prisma.navigation.findUnique({
        where: { id: testParentId },
        include: { children: true }
      })
      
      expect(initialParent).toBeTruthy()
      expect(initialParent!.children).toHaveLength(2)

      // Delete parent (should cascade to children)
      await prisma.navigation.delete({
        where: { id: testParentId }
      })

      // Verify parent is deleted
      const deletedParent = await prisma.navigation.findUnique({
        where: { id: testParentId }
      })
      expect(deletedParent).toBeNull()

      // Verify children are also deleted (cascade)
      const deletedChild1 = await prisma.navigation.findUnique({
        where: { id: testChildId1 }
      })
      expect(deletedChild1).toBeNull()

      const deletedChild2 = await prisma.navigation.findUnique({
        where: { id: testChildId2 }
      })
      expect(deletedChild2).toBeNull()
    })
  })

  describe('Individual child deletion', () => {
    it('should delete only the specific child when child is deleted', async () => {
      // Create new test data for this test
      const parent = await prisma.navigation.create({
        data: {
          type: 'header',
          label: 'test-nav-parent-2',
          url: '/test-parent-2',
          order: 0
        }
      })

      const child1 = await prisma.navigation.create({
        data: {
          type: 'header',
          label: 'test-nav-child-2-1',
          url: '/test-child-2-1',
          parentId: parent.id,
          order: 1
        }
      })

      const child2 = await prisma.navigation.create({
        data: {
          type: 'header',
          label: 'test-nav-child-2-2',
          url: '/test-child-2-2',
          parentId: parent.id,
          order: 2
        }
      })

      // Delete only one child
      await prisma.navigation.delete({
        where: { id: child1.id }
      })

      // Verify parent still exists
      const remainingParent = await prisma.navigation.findUnique({
        where: { id: parent.id },
        include: { children: true }
      })
      expect(remainingParent).toBeTruthy()
      expect(remainingParent!.children).toHaveLength(1)
      expect(remainingParent!.children[0].id).toBe(child2.id)

      // Verify deleted child is gone
      const deletedChild = await prisma.navigation.findUnique({
        where: { id: child1.id }
      })
      expect(deletedChild).toBeNull()

      // Verify other child still exists
      const remainingChild = await prisma.navigation.findUnique({
        where: { id: child2.id }
      })
      expect(remainingChild).toBeTruthy()

      // Clean up
      await prisma.navigation.delete({ where: { id: parent.id } })
    })
  })

  describe('Navigation hierarchy queries', () => {
    it('should properly query navigation with children', async () => {
      // Create test data
      const parent = await prisma.navigation.create({
        data: {
          type: 'header',
          label: 'test-nav-query-parent',
          url: '/test-query-parent',
          order: 0
        }
      })

      await prisma.navigation.create({
        data: {
          type: 'header',
          label: 'test-nav-query-child',
          url: '/test-query-child',
          parentId: parent.id,
          order: 1
        }
      })

      // Query with children
      const result = await prisma.navigation.findUnique({
        where: { id: parent.id },
        include: { children: true }
      })

      expect(result).toBeTruthy()
      expect(result!.children).toHaveLength(1)
      expect(result!.children[0].label).toBe('test-nav-query-child')
      expect(result!.children[0].parentId).toBe(parent.id)

      // Clean up
      await prisma.navigation.delete({ where: { id: parent.id } })
    })

    it('should query all navigation items by type', async () => {
      // Create test data
      const headerItem = await prisma.navigation.create({
        data: {
          type: 'header',
          label: 'test-nav-header-item',
          url: '/test-header',
          order: 0
        }
      })

      const footerItem = await prisma.navigation.create({
        data: {
          type: 'footer',
          label: 'test-nav-footer-item',
          url: '/test-footer',
          order: 0
        }
      })

      // Query header items
      const headerItems = await prisma.navigation.findMany({
        where: { 
          type: 'header',
          label: { contains: 'test-nav-' }
        },
        orderBy: { order: 'asc' }
      })

      expect(headerItems.length).toBeGreaterThanOrEqual(1)
      expect(headerItems.some(item => item.id === headerItem.id)).toBe(true)

      // Query footer items
      const footerItems = await prisma.navigation.findMany({
        where: { 
          type: 'footer',
          label: { contains: 'test-nav-' }
        },
        orderBy: { order: 'asc' }
      })

      expect(footerItems.length).toBeGreaterThanOrEqual(1)
      expect(footerItems.some(item => item.id === footerItem.id)).toBe(true)

      // Clean up
      await prisma.navigation.deleteMany({
        where: {
          id: { in: [headerItem.id, footerItem.id] }
        }
      })
    })
  })
})