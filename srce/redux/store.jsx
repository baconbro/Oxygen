import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import okrReducer from './reducers/okrSlice';

const store = configureStore({
  reducer: {
    okrs: okrReducer,
  },
  preloadedState: {
    okrs: {
      selectedOKR: null, // or some other initial value
      // other properties of okrs...
    },
  },
});

export default store;
