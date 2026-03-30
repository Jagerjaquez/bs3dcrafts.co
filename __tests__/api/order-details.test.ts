import { GET } from '@/app/api/orders/[sessionId]/route'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    order: {
      findUnique: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

const prisma = new PrismaClient()

describe('Order Details API - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch order successfully with valid session ID', async () => {
    const mockOrder = {
      id: 'order_123',
      customerName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      totalAmount: 250,
      status: 'paid',
      stripePaymentId: 'cs_test_session_123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      items: [
        {
          id: 'item_1',
          orderId: 'order_123',
          productId: 'prod_1',
          quantity: 2,
          unitPrice: 100,
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod_1',
            name: 'Product 1',
            slug: 'product-1',
            description: 'Test product',
            price: 100,
            discountedPrice: null,
            stock: 10,
            category: 'test',
            material: 'PLA',
            printTimeEstimate: '2 hours',
            weight: 50,
            featured: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
        {
          id: 'item_2',
          orderId: 'order_123',
          productId: 'prod_2',
          quantity: 1,
          unitPrice: 50,
          createdAt: new Date('2024-01-01'),
          product: {
            id: 'prod_2',
            name: 'Product 2',
            slug: 'product-2',
            description: 'Test product 2',
            price: 50,
            discountedPrice: null,
            stock: 5,
            category: 'test',
            material: 'ABS',
            printTimeEstimate: '1 hour',
            weight: 30,
            featured: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
      ],
    }

    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/cs_test_session_123')
    const response = await GET(request, { params: { sessionId: 'cs_test_session_123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('order_123')
    expect(data.customerName).toBe('John Doe')
    expect(data.email).toBe('john@example.com')
    expect(data.totalAmount).toBe(250)
    expect(data.status).toBe('paid')
    expect(data.stripePaymentId).toBe('cs_test_session_123')
    expect(data.items).toHaveLength(2)
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { stripePaymentId: 'cs_test_session_123' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  })

  it('should return 404 for non-existent session ID', async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/orders/cs_test_nonexistent')
    const response = await GET(request, { params: { sessionId: 'cs_test_nonexistent' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Order not found')
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { stripePaymentId: 'cs_test_nonexistent' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  })

  it('should return 400 for missing session ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders/')
    const response = await GET(request, { params: { sessionId: '' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Session ID is required')
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('should include order items with product details', async () => {
    const mockOrder = {
      id: 'order_123',
      customerName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543210',
      address: '456 Oak Ave',
      totalAmount: 150,
      status: 'paid',
      stripePaymentId: 'cs_test_session_456',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      items: [
        {
          id: 'item_3',
          orderId: 'order_123',
          productId: 'prod_3',
          quantity: 3,
          unitPrice: 50,
          createdAt: new Date('2024-01-02'),
          product: {
            id: 'prod_3',
            name: 'Product 3',
            slug: 'product-3',
            description: 'Test product 3',
            price: 50,
            discountedPrice: 45,
            stock: 20,
            category: 'accessories',
            material: 'PETG',
            printTimeEstimate: '3 hours',
            weight: 75,
            featured: true,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
          },
        },
      ],
    }

    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/cs_test_session_456')
    const response = await GET(request, { params: { sessionId: 'cs_test_session_456' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.items).toHaveLength(1)
    
    // Verify order item details
    const orderItem = data.items[0]
    expect(orderItem.productId).toBe('prod_3')
    expect(orderItem.quantity).toBe(3)
    expect(orderItem.unitPrice).toBe(50)
    
    // Verify product details are included
    expect(orderItem.product).toBeDefined()
    expect(orderItem.product.id).toBe('prod_3')
    expect(orderItem.product.name).toBe('Product 3')
    expect(orderItem.product.slug).toBe('product-3')
    expect(orderItem.product.description).toBe('Test product 3')
    expect(orderItem.product.price).toBe(50)
    expect(orderItem.product.discountedPrice).toBe(45)
    expect(orderItem.product.stock).toBe(20)
    expect(orderItem.product.category).toBe('accessories')
    expect(orderItem.product.material).toBe('PETG')
    expect(orderItem.product.printTimeEstimate).toBe('3 hours')
    expect(orderItem.product.weight).toBe(75)
    expect(orderItem.product.featured).toBe(true)
  })

  it('should handle database errors gracefully', async () => {
    ;(prisma.order.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database connection error')
    )

    const request = new NextRequest('http://localhost:3000/api/orders/cs_test_session_789')
    const response = await GET(request, { params: { sessionId: 'cs_test_session_789' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should verify order data completeness', async () => {
    const mockOrder = {
      id: 'order_456',
      customerName: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '5551234567',
      address: '789 Pine Rd',
      totalAmount: 500,
      status: 'completed',
      stripePaymentId: 'cs_test_session_complete',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04'),
      items: [
        {
          id: 'item_4',
          orderId: 'order_456',
          productId: 'prod_4',
          quantity: 5,
          unitPrice: 100,
          createdAt: new Date('2024-01-03'),
          product: {
            id: 'prod_4',
            name: 'Product 4',
            slug: 'product-4',
            description: 'Complete test product',
            price: 100,
            discountedPrice: null,
            stock: 50,
            category: 'premium',
            material: 'Nylon',
            printTimeEstimate: '5 hours',
            weight: 100,
            featured: true,
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03'),
          },
        },
      ],
    }

    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const request = new NextRequest('http://localhost:3000/api/orders/cs_test_session_complete')
    const response = await GET(request, { params: { sessionId: 'cs_test_session_complete' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    
    // Verify all required order fields are present
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('customerName')
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('phone')
    expect(data).toHaveProperty('address')
    expect(data).toHaveProperty('totalAmount')
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('stripePaymentId')
    expect(data).toHaveProperty('createdAt')
    expect(data).toHaveProperty('updatedAt')
    expect(data).toHaveProperty('items')
    
    // Verify items array is present and has correct structure
    expect(Array.isArray(data.items)).toBe(true)
    expect(data.items.length).toBeGreaterThan(0)
    
    // Verify each item has required fields
    data.items.forEach((item: any) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('orderId')
      expect(item).toHaveProperty('productId')
      expect(item).toHaveProperty('quantity')
      expect(item).toHaveProperty('unitPrice')
      expect(item).toHaveProperty('product')
      
      // Verify product details are complete
      expect(item.product).toHaveProperty('id')
      expect(item.product).toHaveProperty('name')
      expect(item.product).toHaveProperty('slug')
      expect(item.product).toHaveProperty('description')
      expect(item.product).toHaveProperty('price')
      expect(item.product).toHaveProperty('category')
      expect(item.product).toHaveProperty('material')
    })
  })
})
