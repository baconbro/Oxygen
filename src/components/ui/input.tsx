import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    return (
      <div className="tw-w-full">
        <input
          type={type}
          className={cn(
            'tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background',
            'file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium',
            'placeholder:tw-text-muted-foreground',
            'focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2',
            'disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
            error && 'tw-border-danger focus-visible:tw-ring-danger',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p
            className={cn(
              'tw-mt-1 tw-text-xs',
              error ? 'tw-text-danger' : 'tw-text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
