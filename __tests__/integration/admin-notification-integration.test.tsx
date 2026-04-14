/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider } from '@/contexts/toast-context'
import AdminSettingsPage from '@/app/admin/settings/page'

// Mock the admin client
jest.mock('@/lib/admin-client', () => ({
  adminJsonHeaders: () => ({ 'Content-Type': 'application/json' })
}))

// Mock fetch
global.fetch = jest.fn()

describe('Admin Notification Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show success notification when settings are saved successfully', async () => {
    // Mock successful API response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        general: { 'site.title': 'Test Site' },
        contact: { 'contact.email': 'test@example.com' }
      })
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    render(
      <ToastProvider>
        <AdminSettingsPage />
      </ToastProvider>
    )

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Site ayarları')).toBeInTheDocument()
    })

    // Find and click a save button
    const saveButton = screen.getAllByText(/kaydet/i)[0]
    fireEvent.click(saveButton)

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText('Kaydedildi')).toBeInTheDocument()
    })
  })

  it('should show error notification when settings save fails', async () => {
    // Mock failed API response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        general: { 'site.title': 'Test Site' },
        contact: { 'contact.email': 'test@example.com' }
      })
    }).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Validation failed' })
    })

    render(
      <ToastProvider>
        <AdminSettingsPage />
      </ToastProvider>
    )

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Site ayarları')).toBeInTheDocument()
    })

    // Find and click a save button
    const saveButton = screen.getAllByText(/kaydet/i)[0]
    fireEvent.click(saveButton)

    // Wait for error notification
    await waitFor(() => {
      expect(screen.getByText('Kayıt başarısız')).toBeInTheDocument()
      expect(screen.getByText('Validation failed')).toBeInTheDocument()
    })
  })
})