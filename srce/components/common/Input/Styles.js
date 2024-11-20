import styled, { css } from 'styled-components';

import { color, font } from '../../../utils/styles';
import Icon from '../Icon';

export const StyledInput = styled.div`
  position: relative;
  display: inline-block;
  height: 32px;
  width: 100%;
`;

export const InputElement = styled.input`
  transition: background 0.1s;
  ${font.regular}
  ${font.size(15)}
  ${props => props.hasIcon && 'padding-left: 32px;'}
  &:hover {
    background: ${color.backgroundLight};
  }
  &:focus {
    background: #fff;
    border: 1px solid ${color.borderInputFocus};
    box-shadow: 0 0 0 1px ${color.borderInputFocus};
  }
  ${props =>
    props.invalid &&
    css`
      &,
      &:focus {
        border: 1px solid ${color.danger};
        box-shadow: none;
      }
    `}
`;

export const StyledIcon = styled(Icon)`
  position: absolute;
  top: 8px;
  left: 8px;
  pointer-events: none;
  color: ${color.textMedium};
`;
