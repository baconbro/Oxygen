import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useZodForm, commonSchemas, z } from '../../hooks/useZodForm'

describe('useZodForm', () => {
  it('creates a form with schema validation', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })

    const { result } = renderHook(() =>
      useZodForm({
        schema,
        defaultValues: {
          email: '',
          password: '',
        },
      })
    )

    expect(result.current.formState.isValid).toBe(false)
    expect(result.current.getValues()).toEqual({
      email: '',
      password: '',
    })
  })

  it('validates email using trigger method', async () => {
    const schema = z.object({
      email: commonSchemas.email,
    })

    const { result } = renderHook(() =>
      useZodForm({
        schema,
        defaultValues: { email: '' },
      })
    )

    // Set invalid email
    act(() => {
      result.current.setValue('email', 'invalid-email')
    })

    // Trigger validation and check result
    let isValid: boolean = true
    await act(async () => {
      isValid = await result.current.trigger('email')
    })

    expect(isValid).toBe(false)

    // Set valid email and trigger again
    act(() => {
      result.current.setValue('email', 'test@example.com')
    })

    await act(async () => {
      isValid = await result.current.trigger('email')
    })

    expect(isValid).toBe(true)
  })

  it('validates password using trigger method', async () => {
    const schema = z.object({
      password: commonSchemas.password,
    })

    const { result } = renderHook(() =>
      useZodForm({
        schema,
        defaultValues: { password: '' },
      })
    )

    // Test too short
    act(() => {
      result.current.setValue('password', 'short')
    })

    let isValid: boolean = true
    await act(async () => {
      isValid = await result.current.trigger('password')
    })
    expect(isValid).toBe(false)

    // Test valid password
    act(() => {
      result.current.setValue('password', 'ValidPass1')
    })

    await act(async () => {
      isValid = await result.current.trigger('password')
    })
    expect(isValid).toBe(true)
  })
})

describe('commonSchemas', () => {
  it('validates email', () => {
    expect(commonSchemas.email.safeParse('test@example.com').success).toBe(true)
    expect(commonSchemas.email.safeParse('invalid').success).toBe(false)
  })

  it('validates required string', () => {
    const schema = commonSchemas.requiredString('Name')
    expect(schema.safeParse('John').success).toBe(true)
    expect(schema.safeParse('').success).toBe(false)
  })

  it('validates URL', () => {
    expect(commonSchemas.url.safeParse('https://example.com').success).toBe(true)
    expect(commonSchemas.url.safeParse('not-a-url').success).toBe(false)
  })

  it('validates positive number', () => {
    expect(commonSchemas.positiveNumber.safeParse(5).success).toBe(true)
    expect(commonSchemas.positiveNumber.safeParse(-5).success).toBe(false)
    expect(commonSchemas.positiveNumber.safeParse(0).success).toBe(false)
  })

  it('validates non-negative number', () => {
    expect(commonSchemas.nonNegativeNumber.safeParse(0).success).toBe(true)
    expect(commonSchemas.nonNegativeNumber.safeParse(5).success).toBe(true)
    expect(commonSchemas.nonNegativeNumber.safeParse(-5).success).toBe(false)
  })
})
