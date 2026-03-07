import * as React from 'react'
import {
  useForm,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  UseFormProps,
  FormProvider,
  useFormContext,
  Controller,
  ControllerProps,
  FieldPath,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '../../lib/utils'
import { Label } from '../ui/label'

/**
 * Form context type
 */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

/**
 * Form item context for connecting labels with inputs
 */
type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

/**
 * Hook to use form field context
 */
export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField must be used within a FormField')
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext ?? { id: '' }

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

/**
 * Form component with Zod validation
 */
interface FormProps<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>
> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  schema: TSchema
  onSubmit: SubmitHandler<TFieldValues>
  defaultValues?: UseFormProps<TFieldValues>['defaultValues']
  children:
  | React.ReactNode
  | ((form: UseFormReturn<TFieldValues>) => React.ReactNode)
  form?: UseFormReturn<TFieldValues>
}

export function Form<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.infer<TSchema>
>({
  schema,
  onSubmit,
  defaultValues,
  children,
  form: externalForm,
  className,
  ...props
}: FormProps<TSchema, TFieldValues>) {
  const internalForm = useForm<TFieldValues>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  } as any) as any

  const form = externalForm ?? internalForm

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as any) as any}
        className={className}
        {...props}
      >
        {typeof children === 'function' ? children(form as any) : children}
      </form>
    </FormProvider>
  )
}

/**
 * Form field wrapper
 */
interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  children: ControllerProps<TFieldValues, TName>['render']
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ children, ...props }: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} render={children} />
    </FormFieldContext.Provider>
  )
}

/**
 * Form item container
 */
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> { }

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('tw-space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = 'FormItem'

/**
 * Form label
 */
interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> { }

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField()

    return (
      <Label
        ref={ref}
        className={cn(error && 'tw-text-danger', className)}
        htmlFor={formItemId}
        {...props}
      />
    )
  }
)
FormLabel.displayName = 'FormLabel'

/**
 * Form control wrapper for inputs
 */
interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> { }

export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
      <div
        ref={ref}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    )
  }
)
FormControl.displayName = 'FormControl'

/**
 * Form description text
 */
interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> { }

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('tw-text-sm tw-text-muted-foreground', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

/**
 * Form error message
 */
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('tw-text-sm tw-font-medium tw-text-danger', className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

// Re-export types
export type { UseFormReturn, FieldValues, SubmitHandler }
