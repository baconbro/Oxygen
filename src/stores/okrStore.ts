import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types for OKR state
interface OKR {
  id: number | string
  title?: string
  [key: string]: unknown
}

interface OKRState {
  selectedOKR: OKR | null
  selectOKR: (okr: OKR | null) => void
  clearSelection: () => void
}

// OKR Store - replaces Redux okrSlice
export const useOKRStore = create<OKRState>()(
  devtools(
    (set) => ({
      selectedOKR: null,
      selectOKR: (okr) => set({ selectedOKR: okr }, false, 'selectOKR'),
      clearSelection: () => set({ selectedOKR: null }, false, 'clearSelection'),
    }),
    { name: 'OKRStore' }
  )
)

// Selector hooks for common use cases
export const useSelectedOKR = () => useOKRStore((state) => state.selectedOKR)
export const useSelectOKR = () => useOKRStore((state) => state.selectOKR)

// Compatibility hook - matches the old useOKRState API
export const useOKRState = () => {
  const selectedOKR = useOKRStore((state) => state.selectedOKR)
  const selectOKR = useOKRStore((state) => state.selectOKR)

  return {
    selectedOKR,
    selectOKR,
  }
}

export default useOKRStore
