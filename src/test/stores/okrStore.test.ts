import { describe, it, expect, beforeEach } from 'vitest'
import { useOKRStore, useOKRState } from '../../stores/okrStore'
import { act, renderHook } from '@testing-library/react'

describe('OKR Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useOKRStore.setState({ selectedOKR: null })
  })

  it('should have null as initial selectedOKR', () => {
    const { result } = renderHook(() => useOKRStore((state) => state.selectedOKR))
    expect(result.current).toBeNull()
  })

  it('should select an OKR', () => {
    const testOKR = { id: 1, title: 'Test OKR' }

    act(() => {
      useOKRStore.getState().selectOKR(testOKR)
    })

    const { result } = renderHook(() => useOKRStore((state) => state.selectedOKR))
    expect(result.current).toEqual(testOKR)
  })

  it('should clear selection', () => {
    const testOKR = { id: 1, title: 'Test OKR' }

    act(() => {
      useOKRStore.getState().selectOKR(testOKR)
    })

    act(() => {
      useOKRStore.getState().clearSelection()
    })

    const { result } = renderHook(() => useOKRStore((state) => state.selectedOKR))
    expect(result.current).toBeNull()
  })

  it('should work with useOKRState compatibility hook', () => {
    const { result } = renderHook(() => useOKRState())

    expect(result.current.selectedOKR).toBeNull()
    expect(typeof result.current.selectOKR).toBe('function')

    const testOKR = { id: 2, title: 'Another OKR' }
    act(() => {
      result.current.selectOKR(testOKR)
    })

    expect(result.current.selectedOKR).toEqual(testOKR)
  })
})
