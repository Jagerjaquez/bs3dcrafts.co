/**
 * Redirect Management Utility
 * 
 * Handles URL redirects when page slugs change
 * Creates and manages redirect records in the database
 */

import { prisma } from './prisma'

/**
 * Create a redirect from old path to new path
 * 
 * @param fromPath - Old URL path (e.g., '/old-page')
 * @param toPath - New URL path (e.g., '/new-page')
 * @param statusCode - HTTP status code (301 for permanent, 302 for temporary)
 */
export async function createRedirect(
  fromPath: string,
  toPath: string,
  statusCode: number = 301
): Promise<void> {
  // Normalize paths (ensure they start with /)
  const normalizedFromPath = fromPath.startsWith('/') ? fromPath : `/${fromPath}`
  const normalizedToPath = toPath.startsWith('/') ? toPath : `/${toPath}`

  // Don't create redirect if paths are the same
  if (normalizedFromPath === normalizedToPath) {
    return
  }

  try {
    // Check if redirect already exists
    const existing = await prisma.redirect.findUnique({
      where: { fromPath: normalizedFromPath }
    })

    if (existing) {
      // Update existing redirect
      await prisma.redirect.update({
        where: { fromPath: normalizedFromPath },
        data: {
          toPath: normalizedToPath,
          statusCode,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new redirect
      await prisma.redirect.create({
        data: {
          fromPath: normalizedFromPath,
          toPath: normalizedToPath,
          statusCode
        }
      })
    }
  } catch (error) {
    console.error('Error creating redirect:', error)
    // Don't throw error - redirect creation shouldn't fail the main operation
  }
}

/**
 * Create redirect for page slug change
 * 
 * @param oldSlug - Old page slug
 * @param newSlug - New page slug
 */
export async function createPageRedirect(oldSlug: string, newSlug: string): Promise<void> {
  if (!oldSlug || !newSlug || oldSlug === newSlug) {
    return
  }

  const fromPath = `/${oldSlug}`
  const toPath = `/${newSlug}`

  await createRedirect(fromPath, toPath, 301)
}

/**
 * Get redirect for a given path
 * 
 * @param path - URL path to check for redirects
 * @returns Redirect object or null if no redirect exists
 */
export async function getRedirect(path: string): Promise<{
  toPath: string
  statusCode: number
} | null> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  try {
    const redirect = await prisma.redirect.findUnique({
      where: { fromPath: normalizedPath },
      select: { toPath: true, statusCode: true }
    })

    return redirect
  } catch (error) {
    console.error('Error getting redirect:', error)
    return null
  }
}

/**
 * Delete redirect
 * 
 * @param fromPath - Path to remove redirect for
 */
export async function deleteRedirect(fromPath: string): Promise<void> {
  const normalizedPath = fromPath.startsWith('/') ? fromPath : `/${fromPath}`

  try {
    await prisma.redirect.delete({
      where: { fromPath: normalizedPath }
    })
  } catch (error) {
    // Ignore error if redirect doesn't exist
    console.error('Error deleting redirect:', error)
  }
}

/**
 * Clean up old redirects
 * 
 * Removes redirects older than specified days
 * 
 * @param daysOld - Number of days old to consider for cleanup (default: 365)
 */
export async function cleanupOldRedirects(daysOld: number = 365): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  try {
    const result = await prisma.redirect.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    return result.count
  } catch (error) {
    console.error('Error cleaning up redirects:', error)
    return 0
  }
}

/**
 * Get all redirects with pagination
 * 
 * @param page - Page number (1-based)
 * @param limit - Number of redirects per page
 * @returns Paginated redirects
 */
export async function getRedirects(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit

  try {
    const [redirects, total] = await Promise.all([
      prisma.redirect.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.redirect.count()
    ])

    return {
      redirects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error getting redirects:', error)
    return {
      redirects: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    }
  }
}

/**
 * Check if path has redirect chain (to prevent infinite loops)
 * 
 * @param path - Path to check
 * @param maxDepth - Maximum redirect chain depth (default: 5)
 * @returns Final destination path or null if chain is too deep
 */
export async function resolveRedirectChain(
  path: string,
  maxDepth: number = 5
): Promise<string | null> {
  let currentPath = path
  let depth = 0

  while (depth < maxDepth) {
    const redirect = await getRedirect(currentPath)
    
    if (!redirect) {
      // No more redirects, return current path
      return currentPath
    }

    currentPath = redirect.toPath
    depth++
  }

  // Chain too deep, return null to prevent infinite loops
  console.warn(`Redirect chain too deep for path: ${path}`)
  return null
}

/**
 * Validate redirect paths
 * 
 * @param fromPath - Source path
 * @param toPath - Destination path
 * @returns Validation result
 */
export function validateRedirectPaths(fromPath: string, toPath: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check if paths are provided
  if (!fromPath) {
    errors.push('From path is required')
  }

  if (!toPath) {
    errors.push('To path is required')
  }

  // Check if paths are different
  if (fromPath === toPath) {
    errors.push('From path and to path cannot be the same')
  }

  // Check path format (should start with / or be absolute URL)
  const pathPattern = /^\/[a-zA-Z0-9\-_\/]*$|^https?:\/\/.+$/

  if (fromPath && !pathPattern.test(fromPath)) {
    errors.push('From path must be a valid relative or absolute URL')
  }

  if (toPath && !pathPattern.test(toPath)) {
    errors.push('To path must be a valid relative or absolute URL')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}