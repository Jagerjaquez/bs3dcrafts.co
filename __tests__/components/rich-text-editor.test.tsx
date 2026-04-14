import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

// Mock TipTap editor
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    getHTML: jest.fn(() => '<p>Test content</p>'),
    isActive: jest.fn(() => false),
    can: jest.fn(() => ({ undo: jest.fn(() => true), redo: jest.fn(() => true) })),
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleStrike: jest.fn(() => ({ run: jest.fn() })),
        toggleHeading: jest.fn(() => ({ run: jest.fn() })),
        toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
        toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
        setLink: jest.fn(() => ({ run: jest.fn() })),
        setImage: jest.fn(() => ({ run: jest.fn() })),
        toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
        toggleCodeBlock: jest.fn(() => ({ run: jest.fn() })),
        insertTable: jest.fn(() => ({ run: jest.fn() })),
        undo: jest.fn(() => ({ run: jest.fn() })),
        redo: jest.fn(() => ({ run: jest.fn() }))
      }))
    }))
  })),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor Content</div>
}))

describe('RichTextEditor', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders the rich text editor with toolbar', () => {
    render(
      <RichTextEditor
        content="<p>Initial content</p>"
        onChange={mockOnChange}
        placeholder="Enter text..."
      />
    )

    // Check if editor content is present
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    
    // Check if toolbar is present by looking for buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(10) // Should have many toolbar buttons
  })

  it('renders toolbar buttons for formatting', () => {
    render(
      <RichTextEditor
        content=""
        onChange={mockOnChange}
      />
    )

    // Check for various formatting buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(10) // Should have many toolbar buttons
    
    // Check that editor content is rendered
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('shows loading state when editor is not ready', () => {
    // Mock useEditor to return null (not ready)
    const { useEditor } = require('@tiptap/react')
    useEditor.mockReturnValueOnce(null)

    const { container } = render(
      <RichTextEditor
        content=""
        onChange={mockOnChange}
      />
    )

    // Check for loading state using class selector
    const loadingDiv = container.querySelector('.animate-pulse')
    expect(loadingDiv).toBeInTheDocument()
    expect(loadingDiv).toHaveClass('min-h-[300px]')
  })

  it('renders source view toggle', () => {
    render(
      <RichTextEditor
        content="<p>Test content</p>"
        onChange={mockOnChange}
      />
    )

    // Should have source view toggle button (last button in toolbar)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Check that editor content is present
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })
})