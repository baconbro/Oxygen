//import styled from '@xstyled/styled-components';
import styled from 'styled-components';

import { grid } from './constants';

// $ExpectError - not sure why
export default styled.h4`
  padding: ${grid}px;
  transition: background-color ease 0.2s;
  flex-grow: 1;
  user-select: none;
  position: relative;
  &:focus {
    outline: 2px solid #998dd9;
    outline-offset: 2px;
  }
`;

export const Header = styled.h5`
  background-color: ${({ isDragging }) =>
    isDragging ? '#AAAA' : ''};
  transition: background-color 0.2s ease;
  &:hover {
    background-color: ''#CCCC;
  }
`;
