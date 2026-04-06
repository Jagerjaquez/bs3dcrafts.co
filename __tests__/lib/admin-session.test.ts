/**
 * Admin Session Management Tests
 * 
 * Tests for session creation, verification, and cleanup
 */

import { NextRequest } from 'next/server'
import {
  createAdminSession,
  verifyAdminSession,
  deleteAdminSession,
  cleanupExpiredSessions
} from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Admin Session Management', () => {
  const testAdminId = 'test-admin-123'
  let createdSessionIds: string[] = []

  // Clean up test sessions after each test
  afterEach(async () => {
    for (const sessionId of createdSessionIds) {
      await prisma.adminSession.delete({
        where: { id: sessionId }
      }).catch(() => {})
    }
    createdSessionIds = []
  })

  describe('createAdminSession', () => {
    it('should create a new session with correct data', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin', {
        headers: {
          'user-agent': 'Test Browser',
          'x-forwarded-for': '192.168.1.1'
        }
      })

      const sessionId = await createAdminSession(testAdminId, mockRequest)
      createdSessionIds.push(sessionId)

      expect(sessionId).toBeTruthy()
      expect(typeof sessionId).toBe('string')

      // Verify session was created in database
      const session = await prisma.adminSession.findUnique({
        where: { id: sessionId }
      })

      expect(session).toBeTruthy()
      expect(session?.adminId).toBe(testAdminId)
      expect(session?.ipAddress).toBe('192.168.1.1')
      expect(session?.userAgent).toBe('Test Browser')
    })

    it('should set expiration to 24 hours from now', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin')
      const sessionId = await createAdminSession(testAdminId, mockRequest)
      createdSessionIds.push(sessionId)

      const session = await prisma.adminSession.findUnique({
        where: { id: sessionId }
      })

      const expectedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const actualExpiry = session!.expiresAt

      // Allow 1 second tolerance
      expect(Math.abs(actualExpiry.getTime() - expectedExpiry.getTime())).toBeLessThan(1000)
    })
  })

  describe('verifyAdminSession', () => {
    it('should return session data for valid session', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin')
      const sessionId = await createAdminSession(testAdminId, mockRequest)
      createdSessionIds.push(sessionId)

      const session = await verifyAdminSession(sessionId)

      expect(session).toBeTruthy()
      expect(session?.id).toBe(sessionId)
      expect(session?.adminId).toBe(testAdminId)
    })

    it('should return null for non-existent session', async () => {
      const session = await verifyAdminSession('non-existent-session-id')
      expect(session).toBeNull()
    })

    it('should return null for expired session', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin')
      const sessionId = await createAdminSession(testAdminId, mockRequest)
      createdSessionIds.push(sessionId)

      // Manually expire the session
      await prisma.adminSession.update({
        where: { id: sessionId },
        data: { expiresAt: new Date(Date.now() - 1000) }
      })

      const session = await verifyAdminSession(sessionId)
      expect(session).toBeNull()

      // Verify expired session was deleted
      const deletedSession = await prisma.adminSession.findUnique({
        where: { id: sessionId }
      })
      expect(deletedSession).toBeNull()
    })

    it('should update lastUsed timestamp on verification', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin')
      const sessionId = await createAdminSession(testAdminId, mockRequest)
      createdSessionIds.push(sessionId)

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100))

      const originalSession = await prisma.adminSession.findUnique({
        where: { id: sessionId }
      })

      await verifyAdminSession(sessionId)

      const updatedSession = await prisma.adminSession.findUnique({
        where: { id: sessionId }
      })

      expect(updatedSession!.lastUsed.getTime()).toBeGreaterThan(
        originalSession!.lastUsed.getTime()
      )
    })
  })

  describe('deleteAdminSession', () => {
    it('should delete existing session', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin')
      const sessionId = await createAdminSession(testAdminId, mockRequest)

      await deleteAdminSession(sessionId)

      const session = await prisma.adminSession.findUnique({
        where: { id: sessionId }
      })
      expect(session).toBeNull()
    })

    it('should not throw error for non-existent session', async () => {
      await expect(
        deleteAdminSession('non-existent-session-id')
      ).resolves.not.toThrow()
    })
  })

  describe('cleanupExpiredSessions', () => {
    it('should delete expired sessions', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin')
      
      // Create expired session
      const expiredSessionId = await createAdminSession(testAdminId, mockRequest)
      await prisma.adminSession.update({
        where: { id: expiredSessionId },
        data: { expiresAt: new Date(Date.now() - 1000) }
      })

      // Create valid session
      const validSessionId = await createAdminSession(testAdminId, mockRequest)
      createdSessionIds.push(validSessionId)

      const deletedCount = await cleanupExpiredSessions()

      expect(deletedCount).toBeGreaterThanOrEqual(1)

      // Verify expired session was deleted
      const expiredSession = await prisma.adminSession.findUnique({
        where: { id: expiredSessionId }
      })
      expect(expiredSession).toBeNull()

      // Verify valid session still exists
      const validSession = await prisma.adminSession.findUnique({
        where: { id: validSessionId }
      })
      expect(validSession).toBeTruthy()
    })
  })
})
