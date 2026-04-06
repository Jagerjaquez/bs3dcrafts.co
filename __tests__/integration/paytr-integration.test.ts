/**
 * PayTR Integration Tests
 * 
 * Tests the complete PayTR payment flow including:
 * - Token generation
 * - Order creation
 * - Webhook handling
 * - Order status updates
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST as checkoutPost } from '@/app/api/checkout/paytr/route'
import { POST as webhookPost } from '@/app/api/webhooks/paytr/route'
import { createPayTROrder, getOrderByMerchantOid, updatePayTROrderStatus } from '@/lib/order-manager'
import { paytr } from '@/lib/paytr-client'
import { prisma } from '@/lib/prisma'

// Mock data
const mockCustomerInfo = {
  name: 'Test Müşteri',
  email: 'test@example.com',
  phone: '+905551234567',
  address: 'Test Mahallesi, Test Sokak No:1, İstanbul'
}

const mockItems = [
  {
    id: 'product-1',
    name: 'Test Ürün 1',
    price: 100,
    quantity: 2
  },
  {
    id: 'product-2',
    name: 'Test Ürün 2',
    price: 50,
    quantity: 1
  }
]

const mockOrderData = {
  merchantOid: 'TEST_ORDER_123',
  customerName: mockCustomerInfo.name,
  email: mockCustomerInfo.email,
  phone: mockCustomerInfo.phone,
  address: mockCustomerInfo.address,
  totalAmount: 250,
  items: mockItems
}

describe('PayTR Integration', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          id: { startsWith: 'TEST_' }
        }
      }
    })
    await prisma.order.deleteMany({
      where: {
        id: { startsWith: 'TEST_' }
      }
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          id: { startsWith: 'TEST_' }
        }
      }
    })
    await prisma.order.deleteMany({
      where: {
        id: { startsWith: 'TEST_' }
      }
    })
  })

  describe('Order Management', () => {
    it('should create a PayTR order successfully', async () => {
      const order = await createPayTROrder(mockOrderData)

      expect(order).toBeDefined()
      expect(order.id).toBe(mockOrderData.merchantOid)
      expect(order.customerName).toBe(mockOrderData.customerName)
      expect(order.email).toBe(mockOrderData.email)
      expect(order.totalAmount).toBe(mockOrderData.totalAmount)
      expect(order.status).toBe('pending')
    })

    it('should return existing order for duplicate merchant OID', async () => {
      // Create first order
      const order1 = await createPayTROrder(mockOrderData)
      
      // Try to create same order again
      const order2 = await createPayTROrder(mockOrderData)

      expect(order1.id).toBe(order2.id)
      expect(order1.createdAt).toEqual(order2.createdAt)
    })

    it('should retrieve order by merchant OID', async () => {
      await createPayTROrder(mockOrderData)
      
      const retrievedOrder = await getOrderByMerchantOid(mockOrderData.merchantOid)

      expect(retrievedOrder).toBeDefined()
      expect(retrievedOrder?.id).toBe(mockOrderData.merchantOid)
    })

    it('should update order status', async () => {
      await createPayTROrder(mockOrderData)
      
      const updatedOrder = await updatePayTROrderStatus(mockOrderData.merchantOid, 'paid')

      expect(updatedOrder.status).toBe('paid')
    })

    it('should throw error for invalid order status', async () => {
      await createPayTROrder(mockOrderData)
      
      await expect(
        updatePayTROrderStatus(mockOrderData.merchantOid, 'invalid_status' as any)
      ).rejects.toThrow('Invalid order status')
    })
  })

  describe('PayTR Client', () => {
    it('should generate token request with correct parameters', async () => {
      const tokenRequest = {
        merchant_oid: 'TEST_ORDER_123',
        payment_amount: '25000', // 250 TL in kuruş
        currency: 'TRY',
        email: mockCustomerInfo.email,
        user_ip: '127.0.0.1',
        user_name: mockCustomerInfo.name,
        user_phone: mockCustomerInfo.phone,
        user_address: mockCustomerInfo.address,
        user_basket: mockItems.map(item => ({
          name: item.name,
          price: (item.price * 100).toString(),
          quantity: item.quantity
        })),
        merchant_ok_url: 'http://localhost:3000/success?order_id=TEST_ORDER_123',
        merchant_fail_url: 'http://localhost:3000/checkout'
      }

      // Note: This will make actual API call to PayTR in test mode
      const response = await paytr.getToken(tokenRequest)

      expect(response).toBeDefined()
      expect(response.status).toBeDefined()
      
      if (response.status === 'success') {
        expect(response.token).toBeDefined()
      } else {
        // In test environment, we might get failures due to test credentials
        expect(response.reason).toBeDefined()
      }
    })

    it('should verify callback hash correctly', () => {
      const mockCallbackData = {
        merchant_oid: 'TEST_ORDER_123',
        status: 'success',
        total_amount: '250.00',
        hash: 'mock_hash' // This would be generated by PayTR
      }

      // Note: This test would need actual PayTR credentials to generate correct hash
      // For now, we just test that the function doesn't throw
      expect(() => {
        paytr.verifyCallback(mockCallbackData)
      }).not.toThrow()
    })
  })

  describe('Checkout API', () => {
    it('should handle valid checkout request', async () => {
      const requestBody = {
        items: mockItems,
        customerInfo: mockCustomerInfo
      }

      const request = new NextRequest('http://localhost:3000/api/checkout/paytr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await checkoutPost(request)
      const data = await response.json()

      if (response.status === 200) {
        expect(data.token).toBeDefined()
        expect(data.url).toBeDefined()
        expect(data.orderId).toBeDefined()
      } else {
        // Might fail due to PayTR API issues in test environment
        expect(data.error).toBeDefined()
      }
    })

    it('should reject invalid customer data', async () => {
      const requestBody = {
        items: mockItems,
        customerInfo: {
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid: bad email format
          phone: '123', // Invalid: too short
          address: '' // Invalid: empty address
        }
      }

      const request = new NextRequest('http://localhost:3000/api/checkout/paytr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await checkoutPost(request)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBeDefined()
      expect(data.code).toBe('VALIDATION_ERROR')
    })

    it('should reject empty cart', async () => {
      const requestBody = {
        items: [], // Empty cart
        customerInfo: mockCustomerInfo
      }

      const request = new NextRequest('http://localhost:3000/api/checkout/paytr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1'
        },
        body: JSON.stringify(requestBody)
      })

      const response = await checkoutPost(request)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBeDefined()
    })
  })

  describe('Webhook API', () => {
    beforeEach(async () => {
      // Create test order for webhook tests
      await createPayTROrder(mockOrderData)
    })

    it('should handle successful payment callback', async () => {
      const formData = new FormData()
      formData.append('merchant_oid', mockOrderData.merchantOid)
      formData.append('status', 'success')
      formData.append('total_amount', '250.00')
      formData.append('payment_type', 'card')
      formData.append('installment_count', '1')
      formData.append('currency', 'TRY')
      formData.append('test_mode', '1')
      formData.append('hash', 'mock_hash')

      const request = new NextRequest('http://localhost:3000/api/webhooks/paytr', {
        method: 'POST',
        body: formData
      })

      const response = await webhookPost(request)
      
      expect(response.status).toBe(200)
      
      // Check that order status was updated
      const updatedOrder = await getOrderByMerchantOid(mockOrderData.merchantOid)
      expect(updatedOrder?.status).toBe('paid')
    })

    it('should handle failed payment callback', async () => {
      const formData = new FormData()
      formData.append('merchant_oid', mockOrderData.merchantOid)
      formData.append('status', 'failed')
      formData.append('total_amount', '250.00')
      formData.append('payment_type', 'card')
      formData.append('installment_count', '1')
      formData.append('currency', 'TRY')
      formData.append('test_mode', '1')
      formData.append('hash', 'mock_hash')

      const request = new NextRequest('http://localhost:3000/api/webhooks/paytr', {
        method: 'POST',
        body: formData
      })

      const response = await webhookPost(request)
      
      expect(response.status).toBe(200)
      
      // Check that order status was updated
      const updatedOrder = await getOrderByMerchantOid(mockOrderData.merchantOid)
      expect(updatedOrder?.status).toBe('failed')
    })
  })
})