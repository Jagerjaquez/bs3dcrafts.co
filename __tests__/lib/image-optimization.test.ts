import { 
  validateImageType, 
  validateImageSize, 
  generateImageFilename, 
  getDimensionsString 
} from '@/lib/image-optimization'

describe('Image Optimization Utils', () => {
  describe('validateImageType', () => {
    it('should accept valid image types', () => {
      expect(validateImageType('image/jpeg')).toBe(true)
      expect(validateImageType('image/jpg')).toBe(true)
      expect(validateImageType('image/png')).toBe(true)
      expect(validateImageType('image/webp')).toBe(true)
      expect(validateImageType('image/gif')).toBe(true)
    })

    it('should reject invalid image types', () => {
      expect(validateImageType('text/plain')).toBe(false)
      expect(validateImageType('application/pdf')).toBe(false)
      expect(validateImageType('video/mp4')).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(validateImageType('IMAGE/JPEG')).toBe(true)
      expect(validateImageType('Image/Png')).toBe(true)
    })
  })

  describe('validateImageSize', () => {
    it('should accept files under 5MB', () => {
      expect(validateImageSize(1024)).toBe(true) // 1KB
      expect(validateImageSize(1024 * 1024)).toBe(true) // 1MB
      expect(validateImageSize(5 * 1024 * 1024)).toBe(true) // 5MB exactly
    })

    it('should reject files over 5MB', () => {
      expect(validateImageSize(5 * 1024 * 1024 + 1)).toBe(false) // 5MB + 1 byte
      expect(validateImageSize(10 * 1024 * 1024)).toBe(false) // 10MB
    })
  })

  describe('generateImageFilename', () => {
    it('should generate filename with correct format', () => {
      const filename = generateImageFilename('test-image.jpg', 'large')
      
      expect(filename).toMatch(/^test-image-large-\d+-[a-z0-9]{6}\.webp$/)
    })

    it('should sanitize special characters', () => {
      const filename = generateImageFilename('test@#$%image!.jpg', 'thumbnail')
      
      expect(filename).toMatch(/^test----image--thumbnail-\d+-[a-z0-9]{6}\.webp$/)
    })

    it('should limit filename length', () => {
      const longName = 'a'.repeat(100) + '.jpg'
      const filename = generateImageFilename(longName, 'medium')
      
      // Should be limited to 50 chars for base name + size + timestamp + random + extension
      expect(filename.length).toBeLessThan(100)
      expect(filename).toContain('-medium-')
    })

    it('should handle different sizes', () => {
      const sizes: Array<'thumbnail' | 'medium' | 'large'> = ['thumbnail', 'medium', 'large']
      
      sizes.forEach(size => {
        const filename = generateImageFilename('test.jpg', size)
        expect(filename).toContain(`-${size}-`)
        expect(filename).toMatch(/\.webp$/)
      })
    })
  })

  describe('getDimensionsString', () => {
    it('should format dimensions correctly', () => {
      expect(getDimensionsString(800, 600)).toBe('800x600')
      expect(getDimensionsString(1920, 1080)).toBe('1920x1080')
      expect(getDimensionsString(100, 100)).toBe('100x100')
    })

    it('should handle zero dimensions', () => {
      expect(getDimensionsString(0, 0)).toBe('0x0')
      expect(getDimensionsString(800, 0)).toBe('800x0')
    })
  })
})