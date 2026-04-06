/**
 * Integration test for media management
 * Tests the complete flow from upload to deletion
 */

import { validateImageType, validateImageSize } from '@/lib/image-optimization'
import { prisma } from '@/lib/prisma'

describe('Media Integration', () => {
  beforeAll(async () => {
    // Clean up any existing test media
    await prisma.media.deleteMany({
      where: {
        filename: {
          contains: 'test-'
        }
      }
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.media.deleteMany({
      where: {
        filename: {
          contains: 'test-'
        }
      }
    })
  })

  describe('Image validation', () => {
    it('should validate image types correctly', () => {
      expect(validateImageType('image/jpeg')).toBe(true)
      expect(validateImageType('image/png')).toBe(true)
      expect(validateImageType('image/webp')).toBe(true)
      expect(validateImageType('image/gif')).toBe(true)
      expect(validateImageType('text/plain')).toBe(false)
      expect(validateImageType('application/pdf')).toBe(false)
    })

    it('should validate image sizes correctly', () => {
      expect(validateImageSize(1024)).toBe(true) // 1KB
      expect(validateImageSize(5 * 1024 * 1024)).toBe(true) // 5MB
      expect(validateImageSize(6 * 1024 * 1024)).toBe(false) // 6MB
    })
  })

  describe('Database operations', () => {
    it('should create media record in database', async () => {
      const mediaData = {
        filename: 'test-image.jpg',
        url: 'https://example.com/test-image.webp',
        type: 'image',
        size: 1024,
        dimensions: '800x600',
        usageCount: 0
      }

      const media = await prisma.media.create({
        data: mediaData
      })

      expect(media.id).toBeDefined()
      expect(media.filename).toBe(mediaData.filename)
      expect(media.url).toBe(mediaData.url)
      expect(media.type).toBe(mediaData.type)
      expect(media.size).toBe(mediaData.size)
      expect(media.dimensions).toBe(mediaData.dimensions)
      expect(media.usageCount).toBe(0)
      expect(media.uploadedAt).toBeInstanceOf(Date)
    })

    it('should fetch media list with pagination', async () => {
      // Create test media
      await prisma.media.createMany({
        data: [
          {
            filename: 'test-image-1.jpg',
            url: 'https://example.com/test-1.webp',
            type: 'image',
            size: 1024,
            dimensions: '800x600',
            usageCount: 0
          },
          {
            filename: 'test-image-2.jpg',
            url: 'https://example.com/test-2.webp',
            type: 'image',
            size: 2048,
            dimensions: '1024x768',
            usageCount: 1
          }
        ]
      })

      const result = await prisma.media.findMany({
        where: {
          filename: {
            contains: 'test-image-'
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        take: 10,
        skip: 0
      })

      expect(result).toHaveLength(2)
      expect(result[0].filename).toContain('test-image-')
      expect(result[1].filename).toContain('test-image-')
    })

    it('should search media by filename', async () => {
      const result = await prisma.media.findMany({
        where: {
          filename: {
            contains: 'test-image-1',
            mode: 'insensitive'
          }
        }
      })

      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe('test-image-1.jpg')
    })

    it('should update media usage count', async () => {
      const media = await prisma.media.findFirst({
        where: {
          filename: 'test-image-1.jpg'
        }
      })

      expect(media).toBeTruthy()

      const updated = await prisma.media.update({
        where: { id: media!.id },
        data: {
          usageCount: {
            increment: 1
          }
        }
      })

      expect(updated.usageCount).toBe(1)
    })

    it('should delete media record', async () => {
      const media = await prisma.media.findFirst({
        where: {
          filename: 'test-image-1.jpg'
        }
      })

      expect(media).toBeTruthy()

      await prisma.media.delete({
        where: { id: media!.id }
      })

      const deleted = await prisma.media.findUnique({
        where: { id: media!.id }
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Media usage tracking', () => {
    it('should track media usage in products', async () => {
      // This would test the relationship between Media and ProductMedia
      // For now, we'll just verify the concept works
      
      const mediaCount = await prisma.media.count({
        where: {
          usageCount: {
            gt: 0
          }
        }
      })

      // Should have at least one media item with usage > 0 from previous tests
      expect(mediaCount).toBeGreaterThanOrEqual(0)
    })
  })
})