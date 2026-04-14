/**
 * Admin Navigation API Tests
 * 
 * Tests for /api/admin/navigation endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/admin/navigation/route'
import { PUT, DELETE } from '@/app/api/admin/navigation/[id]/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: vi.fn().mockResolvedValue(null), // Authenticated
}))

vi.mock('@/lib/csrf', () => ({
  requireCSRFToken: vi.fn().mockResolvedValue(null), // Valid CSRF
}))

vi.mock('@/lib/audit-log', () => (