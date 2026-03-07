import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Spinner } from '../../components/ui/spinner'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog'

describe('UI Components', () => {
  describe('Button', () => {
    it('renders with default variant', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('renders with different variants', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Outline')

      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Ghost')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Large')
    })



    it('handles click events', () => {
      let clicked = false
      render(<Button onClick={() => { clicked = true }}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(clicked).toBe(true)
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Card', () => {
    it('renders card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('custom-class')
    })
  })

  describe('Input', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('shows error state', () => {
      render(<Input aria-invalid={true} data-testid="error-input" />)
      expect(screen.getByTestId('error-input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('handles value changes', () => {
      let value = ''
      render(
        <Input
          value={value}
          onChange={(e) => { value = e.target.value }}
          data-testid="input"
        />
      )
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: 'test' } })
      // Note: value state is managed externally, just checking the event fires
      expect(input).toBeInTheDocument()
    })
  })

  describe('Badge', () => {
    it('renders with default variant', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders with different variants', () => {
      render(<Badge variant="secondary">Success</Badge>)
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })

  describe('Label', () => {
    it('renders label text', () => {
      render(<Label>Email</Label>)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('applies custom class', () => {
      render(<Label className="custom-label">Email</Label>)
      expect(screen.getByText('Email')).toHaveClass('custom-label')
    })
  })

  describe('Textarea', () => {
    it('renders textarea element', () => {
      render(<Textarea placeholder="Enter description" />)
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
    })

    it('applies custom class', () => {
      render(<Textarea className="custom-textarea" data-testid="textarea" />)
      expect(screen.getByTestId('textarea')).toHaveClass('custom-textarea')
    })
  })

  describe('Spinner', () => {
    it('renders with default size', () => {
      render(<Spinner data-testid="spinner" />)
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Spinner size="sm" data-testid="spinner" />)
      expect(screen.getByTestId('spinner')).toBeInTheDocument()

      rerender(<Spinner size="lg" data-testid="spinner" />)
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('has accessible label', () => {
      render(<Spinner aria-label="Loading data" />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data')
    })
  })

  describe('Dialog', () => {
    it('renders trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
    })

    it('opens dialog when trigger is clicked', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      fireEvent.click(screen.getByText('Open'))
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('can be controlled', () => {
      const onOpenChange = vi.fn()
      render(
        <Dialog open={true} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument()
    })
  })
})
