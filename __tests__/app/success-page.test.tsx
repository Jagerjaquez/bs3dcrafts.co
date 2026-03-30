/**
 * @jest-environment jsdom
 * 
 * Unit Tests for Success Page Component
 * 
 * Tests order details display, cart clearing, and missing session ID handling
 * Requirements: 3.7, 8.1, 8.2, 8.3, 8.4
 */

import { render, screen, waitFor } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import SuccessPage from '@/app/success/page'
import { useCartStore } from '@/store/cart'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

// Mock cart store
jest.mock('@/store/cart', () => ({
  useCartStore: jest.fn(),
}))

// Mock components
jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

jest.mock('@/components/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

// Mock fetch
global.fetch = jest.fn()

describe('Success Page', () => {
  const mockClearCart = jest.fn()
  const mockSearchParams = {
    get: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(useCartStore as unknown as jest.Mock).mockReturnValue(mockClearCart)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Cart Clearing', () => {
    it('should clear cart after successful payment', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalledTimes(1)
      })
    })

    it('should clear cart even when session_id is missing', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      await waitFor(() => {
        expect(mockClearCart).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Order Details Display', () => {
    const mockOrder = {
      id: 'order_123',
      customerName: 'Test Customer',
      email: 'test@example.com',
      totalAmount: 150.50,
      status: 'paid',
      items: [
        {
          id: 'item_1',
          productId: 'prod_1',
          quantity: 2,
          unitPrice: 50.25,
          product: {
            id: 'prod_1',
            name: 'Test Product 1',
            image: '/test-image-1.jpg',
          },
        },
        {
          id: 'item_2',
          productId: 'prod_2',
          quantity: 1,
          unitPrice: 50.00,
          product: {
            id: 'prod_2',
            name: 'Test Product 2',
            image: '/test-image-2.jpg',
          },
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
    }

    it('should fetch and display order details with valid session_id', async () => {
      const sessionId = 'cs_test_123'
      mockSearchParams.get.mockReturnValue(sessionId)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })

      render(<SuccessPage />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
      })

      // Check order details are displayed
      expect(screen.getByText('Sipariş Detayları')).toBeInTheDocument()
      expect(screen.getByText('order_123')).toBeInTheDocument()
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('paid')).toBeInTheDocument()

      // Check items are displayed
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('2 x ₺50.25')).toBeInTheDocument()
      expect(screen.getByText('1 x ₺50.00')).toBeInTheDocument()

      // Check total amount
      expect(screen.getByText('₺150.50')).toBeInTheDocument()

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(`/api/orders/${sessionId}`)
    })

    it('should display loading state while fetching order', async () => {
      const sessionId = 'cs_test_123'
      mockSearchParams.get.mockReturnValue(sessionId)
      
      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      ;(global.fetch as jest.Mock).mockReturnValue(fetchPromise)

      render(<SuccessPage />)

      // Check loading spinner is displayed by looking for the loader class
      const loader = document.querySelector('.animate-spin')
      expect(loader).toBeInTheDocument()

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => mockOrder,
      })

      // Wait for loading to complete
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
      })
    })

    it('should display all order items with correct calculations', async () => {
      const sessionId = 'cs_test_123'
      mockSearchParams.get.mockReturnValue(sessionId)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })

      render(<SuccessPage />)

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
      })

      // Check item subtotals
      expect(screen.getByText('₺100.50')).toBeInTheDocument() // 2 x 50.25
      expect(screen.getByText('₺50.00')).toBeInTheDocument() // 1 x 50.00
    })
  })

  describe('Missing Session ID Handling', () => {
    it('should show generic success message when session_id is missing', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      await waitFor(() => {
        expect(screen.getByText('Siparişiniz Alındı!')).toBeInTheDocument()
      })

      // Should show generic message
      expect(
        screen.getByText('Sipariş detayları yüklenemedi, ancak ödemeniz başarıyla alındı.')
      ).toBeInTheDocument()

      // Should not attempt to fetch order
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should not display order details section when session_id is missing', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      await waitFor(() => {
        expect(screen.queryByText('Sipariş Detayları')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const sessionId = 'cs_test_123'
      mockSearchParams.get.mockReturnValue(sessionId)
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<SuccessPage />)

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
      })

      // Should show generic success message
      expect(
        screen.getByText('Sipariş detayları yüklenemedi, ancak ödemeniz başarıyla alındı.')
      ).toBeInTheDocument()

      // Should not display order details
      expect(screen.queryByText('Sipariş Detayları')).not.toBeInTheDocument()
    })

    it('should handle 404 order not found', async () => {
      const sessionId = 'cs_test_invalid'
      mockSearchParams.get.mockReturnValue(sessionId)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      render(<SuccessPage />)

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
      })

      // Should show generic success message
      expect(
        screen.getByText('Sipariş detayları yüklenemedi, ancak ödemeniz başarıyla alındı.')
      ).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should display success icon and message', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      expect(screen.getByText('Siparişiniz Alındı!')).toBeInTheDocument()
      expect(
        screen.getByText('Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacak.')
      ).toBeInTheDocument()
    })

    it('should display navigation buttons', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      expect(screen.getByText('Alışverişe Devam Et')).toBeInTheDocument()
      expect(screen.getByText('Ana Sayfa')).toBeInTheDocument()
    })

    it('should render navbar and footer', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<SuccessPage />)

      expect(screen.getByTestId('navbar')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })
})
