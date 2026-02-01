import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Simple button component for testing the setup
const TestButton = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} data-testid="test-button">
    {children}
  </button>
)

describe('Testing Setup Verification', () => {
  it('renders a button correctly', () => {
    render(<TestButton>Click me</TestButton>)

    expect(screen.getByTestId('test-button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => { clicked = true }

    render(<TestButton onClick={handleClick}>Click me</TestButton>)

    await user.click(screen.getByTestId('test-button'))

    expect(clicked).toBe(true)
  })

  it('can use jest-dom matchers', () => {
    render(<TestButton>Test</TestButton>)

    const button = screen.getByTestId('test-button')
    expect(button).toBeVisible()
    expect(button).toHaveTextContent('Test')
  })
})
