import * as React from 'react'
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { Input, InputProps } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea, TextareaProps } from '../ui/textarea'
import { cn } from '../../lib/utils'

/**
 * Form input field with automatic validation
 */
interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, 'name'> {
  name: FieldPath<T>
  label?: string
  description?: string
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  className,
  ...props
}: FormInputProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>()

  const error = errors[name]
  const errorMessage = error?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('tw-space-y-2', className)}>
          {label && (
            <Label htmlFor={name}>
              {label}
              {props.required && <span className="tw-text-destructive tw-ml-1">*</span>}
            </Label>
          )}
          <Input
            id={name}
            aria-invalid={!!error}
            {...field}
            {...props}
          />
          {(errorMessage || description) && (
            <p
              className={cn(
                'tw-text-xs',
                error ? 'tw-text-destructive' : 'tw-text-muted-foreground'
              )}
            >
              {errorMessage || description}
            </p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Form textarea field with automatic validation
 */
interface FormTextareaProps<T extends FieldValues>
  extends Omit<TextareaProps, 'name'> {
  name: FieldPath<T>
  label?: string
  description?: string
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  className,
  ...props
}: FormTextareaProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>()

  const error = errors[name]
  const errorMessage = error?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('tw-space-y-2', className)}>
          {label && (
            <Label htmlFor={name}>
              {label}
              {props.required && <span className="tw-text-destructive tw-ml-1">*</span>}
            </Label>
          )}
          <Textarea
            id={name}
            aria-invalid={!!error}
            {...field}
            {...props}
          />
          {(errorMessage || description) && (
            <p
              className={cn(
                'tw-text-xs',
                error ? 'tw-text-destructive' : 'tw-text-muted-foreground'
              )}
            >
              {errorMessage || description}
            </p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Form select field with automatic validation
 */
interface FormSelectProps<T extends FieldValues>
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: FieldPath<T>
  label?: string
  description?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  description,
  options,
  placeholder,
  className,
  required,
  ...props
}: FormSelectProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>()

  const error = errors[name]
  const errorMessage = error?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('tw-space-y-2', className)}>
          {label && (
            <Label htmlFor={name}>
              {label}
              {required && <span className="tw-text-destructive tw-ml-1">*</span>}
            </Label>
          )}
          <select
            id={name}
            className={cn(
              'tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm',
              'focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2',
              'disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
              error && 'tw-border-danger focus-visible:tw-ring-danger'
            )}
            {...field}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(errorMessage || description) && (
            <p
              className={cn(
                'tw-text-xs',
                error ? 'tw-text-danger' : 'tw-text-muted-foreground'
              )}
            >
              {errorMessage || description}
            </p>
          )}
        </div>
      )}
    />
  )
}

/**
 * Form checkbox field with automatic validation
 */
interface FormCheckboxProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: FieldPath<T>
  label: string
  description?: string
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  className,
  ...props
}: FormCheckboxProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>()

  const error = errors[name]
  const errorMessage = error?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <div className={cn('tw-space-y-2', className)}>
          <div className="tw-flex tw-items-center tw-space-x-2">
            <input
              type="checkbox"
              id={name}
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className={cn(
                'tw-h-4 tw-w-4 tw-rounded tw-border tw-border-input',
                'focus:tw-ring-2 focus:tw-ring-ring focus:tw-ring-offset-2',
                error && 'tw-border-danger'
              )}
              {...field}
              {...props}
            />
            <Label htmlFor={name} className="tw-cursor-pointer">
              {label}
            </Label>
          </div>
          {(errorMessage || description) && (
            <p
              className={cn(
                'tw-text-xs',
                error ? 'tw-text-danger' : 'tw-text-muted-foreground'
              )}
            >
              {errorMessage || description}
            </p>
          )}
        </div>
      )}
    />
  )
}
