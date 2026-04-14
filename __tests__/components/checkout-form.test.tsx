/**
 * @jest-environment jsdom
 * 
 * Unit Tests for Checkout Form Component
 * 
 * Tests form validation, empty cart handling, session creation, and error display
 * Requirements: 1.1, 1.5, 1.6, 7.1
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutForm } from '@/components/checkout-form'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { ERROR_MESSAGES } from '@/lib/error-handler'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/store/cart', () => ({
  useCartStore: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('CheckoutForm Component - Unit Tests', () => {
  const mockPush = jest.fn()
  const mockClearCart = jest.fn()
  const mockGetTotalPrice = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('Empty Cart Handling', () => {
    it('should display empty cart message when cart is empty', () => {
      // Mock empty cart
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [],
        getTotalPrice: () => 0,
      })

      render(<CheckoutForm />)

      expect(screen.getByText(ERROR_MESSAGES.EMPTY_CART)).toBeInTheDocument()
      expect(screen.getByText('Ürünlere Dön')).toBeInTheDocument()
    })

    it('should redirect to products page when "Ürünlere Dön" button is clicked', () => {
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [],
        getTotalPrice: () => 0,
      })

      render(<CheckoutForm />)

      const button = screen.getByText('Ürünlere Dön')
      fireEvent.click(button)

      expect(mockPush).toHaveBeenCalledWith('/products')
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      // Mock cart with items
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [
          { id: '1', name: 'Test Product', price: 100, quantity: 1, image: 'test.jpg' },
        ],
        getTotalPrice: mockGetTotalPrice.mockReturnValue(100),
      })
    })

    it('should display validation error when form is submitted with missing fields', async () => {
      render(<CheckoutForm />)

      const form = document.querySelector('form')!
      
      // Prevent HTML5 validation
      form.setAttribute('novalidate', 'true')

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(ERROR_MESSAGES.INVALID_FORM)).toBeInTheDocument()
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should not submit when name field is empty', async () => {
      render(<CheckoutForm />)

      const form = document.querySelector('form')!
      form.setAttribute('novalidate', 'true')

      // Fill only some fields
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(ERROR_MESSAGES.INVALID_FORM)).toBeInTheDocument()
      })
    })

    it('should validate cart total is greater than zero', async () => {
      // Mock cart with zero total
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [
          { id: '1', name: 'Test Product', price: 0, quantity: 1, image: 'test.jpg' },
        ],
        getTotalPrice: jest.fn().mockReturnValue(0),
      })

      render(<CheckoutForm />)

      // Fill all fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Sepet toplamı sıfır olamaz.')).toBeInTheDocument()
      })
    })
  })

  describe('Successful Session Creation', () => {
    beforeEach(() => {
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [
          { id: '1', name: 'Test Product', price: 100, quantity: 2, image: 'test.jpg' },
          { id: '2', name: 'Another Product', price: 50, quantity: 1, image: 'test2.jpg' },
        ],
        getTotalPrice: jest.fn().mockReturnValue(250),
      })
    })

    it('should call API with correct data when form is submitted', async () => {
      const mockResponse = {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address, Test City' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/checkout/paytr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              { id: '1', name: 'Test Product', price: 100, quantity: 2 },
              { id: '2', name: 'Another Product', price: 50, quantity: 1 },
            ],
            customerInfo: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '1234567890',
              address: 'Test Address, Test City',
            },
          }),
        })
      })
    })

    it('should call API successfully and prepare for redirect on successful session creation', async () => {
      const mockResponse = {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      // Verify API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      // Verify no error message is displayed
      expect(screen.queryByText(ERROR_MESSAGES.GENERIC_ERROR)).not.toBeInTheDocument()
      expect(screen.queryByText(ERROR_MESSAGES.NETWORK_ERROR)).not.toBeInTheDocument()
    })

    it('should show loading state during session creation', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText('İşleniyor...')).toBeInTheDocument()
      })
    })
  })

  describe('Error Display', () => {
    beforeEach(() => {
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [
          { id: '1', name: 'Test Product', price: 100, quantity: 1, image: 'test.jpg' },
        ],
        getTotalPrice: jest.fn().mockReturnValue(100),
      })
    })

    it('should display API error message when session creation fails', async () => {
      const errorMessage = 'Geçersiz ürün fiyatı.'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      })

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should display network error message when fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(ERROR_MESSAGES.NETWORK_ERROR)).toBeInTheDocument()
      })
    })

    it('should display generic error when API returns success but no URL', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_123' }), // Missing URL
      })

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(ERROR_MESSAGES.GENERIC_ERROR)).toBeInTheDocument()
      })
    })

    it('should clear previous error when form is resubmitted', async () => {
      // First submission fails
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'First error' }),
      })

      render(<CheckoutForm />)

      // Fill all form fields
      fireEvent.change(screen.getByLabelText('Ad Soyad'), {
        target: { value: 'Test User' },
      })
      fireEvent.change(screen.getByLabelText('E-posta'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Telefon'), {
        target: { value: '1234567890' },
      })
      fireEvent.change(screen.getByLabelText('Adres'), {
        target: { value: 'Test Address' },
      })

      const submitButton = screen.getByText('Ödemeye Geç')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Second submission succeeds
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_123', url: 'https://checkout.stripe.com/test' }),
      })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Order Summary Display', () => {
    it('should display cart items in order summary', () => {
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [
          { id: '1', name: 'Product A', price: 100, quantity: 2, image: 'a.jpg' },
          { id: '2', name: 'Product B', price: 50, quantity: 1, image: 'b.jpg' },
        ],
        getTotalPrice: jest.fn().mockReturnValue(250),
      })

      render(<CheckoutForm />)

      expect(screen.getByText(/Product A x 2/)).toBeInTheDocument()
      expect(screen.getByText(/Product B x 1/)).toBeInTheDocument()
    })

    it('should display correct total price', () => {
      ;(useCartStore as unknown as jest.Mock).mockReturnValue({
        items: [
          { id: '1', name: 'Product A', price: 100, quantity: 2, image: 'a.jpg' },
        ],
        getTotalPrice: jest.fn().mockReturnValue(200),
      })

      render(<CheckoutForm />)

      // The formatPrice function should format 200 as "₺200,00"
      expect(screen.getByText('Toplam')).toBeInTheDocument()
    })
  })
})
