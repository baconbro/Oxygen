import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/**
 * Custom hook that wraps useForm with Zod validation
 * Provides type-safe form handling with automatic schema validation
 *
 * @example
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * })
 *
 * const form = useZodForm({ schema })
 */
export function useZodForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>
>(
  props: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
    schema: TSchema
  }
): UseFormReturn<TFieldValues> {
  const { schema, ...formProps } = props

  return useForm<TFieldValues>({
    ...formProps,
    resolver: zodResolver(schema) as any,
  } as any) as any
}

/**
 * Helper to get error message for a field
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
): string | undefined {
  const error = form.formState.errors[name]
  return error?.message as string | undefined
}

/**
 * Helper to check if a field has an error
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
): boolean {
  return !!form.formState.errors[name]
}

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  email: z.string().email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  requiredString: (fieldName: string) =>
    z.string().min(1, `${fieldName} is required`),

  optionalString: z.string().optional(),

  url: z.string().url('Please enter a valid URL'),

  positiveNumber: z.number().positive('Must be a positive number'),

  nonNegativeNumber: z.number().min(0, 'Cannot be negative'),

  date: z.coerce.date(),

  futureDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Date must be in the future',
  }),

  pastDate: z.coerce.date().refine((date) => date < new Date(), {
    message: 'Date must be in the past',
  }),
}

/**
 * Type helper for form data
 */
export type FormData<T extends z.ZodType> = z.infer<T>

/**
 * Re-export commonly used types
 */
export type { UseFormReturn, FieldValues, Path }
export { z }
