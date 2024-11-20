import { useDispatch, useSelector } from 'react-redux';
import { setSelectedOKR } from '../redux/reducers/okrSlice';

export const useOKRState = () => {
  const dispatch = useDispatch();
  const selectedOKR = useSelector((state) => state.okrs.selectedOKR);

  const selectOKR = (okr) => {
    dispatch(setSelectedOKR(okr));
  };

  return {
    selectedOKR,
    selectOKR,
  };
};
