import { createSlice } from '@reduxjs/toolkit';

const okrSlice = createSlice({
  name: 'okrs',
  initialState: {
    selectedOKR: null,
  },
  reducers: {
    setSelectedOKR(state, action) {
      state.selectedOKR = action.payload;
    },
  },
});

export const { setSelectedOKR } = okrSlice.actions;

export default okrSlice.reducer;
