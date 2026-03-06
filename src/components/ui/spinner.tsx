import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const spinnerVariants = cva('tw-animate-spin', {
  variants: {
    size: {
      sm: 'tw-h-4 tw-w-4',
      default: 'tw-h-6 tw-w-6',
      lg: 'tw-h-8 tw-w-8',
      xl: 'tw-h-12 tw-w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, label = 'Loading...', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className={cn(spinnerVariants({ size }), className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <circle
          className="tw-opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="tw-opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
        <span className="tw-sr-only">{label}</span>
      </svg>
    )
  }
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
