/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider, useToast } from '@/contexts/toast-context'

// Test component that uses the toast system
function TestComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast()

  return (
    <div>
      <button onClick={() => showSuccess('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => showError('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning!', 'Please be careful')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info!', 'Just so you know')}>
        Show Info
      </button>
    </div>
  )
}

describe('Admin Notification System', () => {
  it('should display success notifications', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successButton = screen.getByText('Show Success')
    fireEvent.click(successButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText('Operation completed')).toBeInTheDocument()
    })
  })

  it('should display error notifications', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const errorButton = screen.getByText('Show Error')
    fireEvent.click(errorButton)

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  it('should display warning notifications', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const warningButton = screen.getByText('Show Warning')
    fireEvent.click(warningButton)

    await waitFor(() => {
      expect(screen.getByText('Warning!')).toBeInTheDocument()
      expect(screen.getByText('Please be careful')).toBeInTheDocument()
    })
  })

  it('should display info notifications', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const infoButton = screen.getByText('Show Info')
    fireEvent.click(infoButton)

    await waitFor(() => {
      expect(screen.getByText('Info!')).toBeInTheDocument()
      expect(screen.getByText('Just so you know')).toBeInTheDocument()
    })
  })

  it('should auto-dismiss notifications after 5 seconds', async () => {
    jest.useFakeTimers()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successButton = screen.getByText('Show Success')
    fireEvent.click(successButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    })

    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should allow manual dismissal of notifications', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successButton = screen.getByText('Show Success')
    fireEvent.click(successButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
    })

    // Find and click the close button (X icon)
    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    })
  })
})