import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import { color, font, mixin } from '../shared/utils/styles';
import { Avatar } from '../../../components/common';

export const IssueLink = styled(Link)`
  display: block;
  margin-bottom: 5px;
  color: rgb(23, 43, 77);
`;

export const Issue = styled.div`
  
  
  transition: background 0.1s;
  ${mixin.clickable}

  &:hover {
    background: ${color.backgroundLight};
  }
  ${props =>
    props.isBeingDragged &&
    css`
      transform: rotate(3deg);
      box-shadow: 5px 10px 30px 0px rgba(9, 30, 66, 0.15);
    `}
`;

export const Title = styled.p`
  padding-bottom: 11px;
  ${font.size(15)}
  @media (max-width: 1100px) {
    ${font.size(14.5)}
  }
`;

export const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Assignees = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-left: 2px;
`;

export const AssigneeAvatar = styled(Avatar)`
  margin-left: -2px;
  box-shadow: 0 0 0 2px #fff;
`;
