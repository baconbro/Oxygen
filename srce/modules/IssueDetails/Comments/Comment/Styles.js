import styled, { css } from 'styled-components';

import { color, font, mixin } from '../../../../utils/styles';
import { Avatar } from '../../../../components/common';

export const Comment = styled.div`
  position: relative;
  margin-top: 25px;
  ${font.size(15)}
`;

export const UserAvatar = styled(Avatar)`
  position: relative;
  top: 0;
  left: 0;
`;

export const Content = styled.div`
  padding-left: 44px;
`;

export const Username = styled.div`
  display: inline-block;
  padding-right: 12px;
  padding-bottom: 10px;
  color: ${color.textDark};
  ${font.medium}
`;

export const CreatedAt = styled.div`
  display: inline-block;
  padding-bottom: 10px;
  color: ${color.textDark};
  ${font.size(14.5)}
`;

export const Body = styled.p`
  padding-bottom: 10px;
  white-space: pre-wrap;
`;

const actionLinkStyles = css`
  display: inline-block;
  padding: 2px 0;
  color: ${color.textMedium};
  ${font.size(14.5)}
  ${mixin.clickable}
  &:hover {
    text-decoration: underline;
  }
`;

export const EditLink = styled.div`
  margin-right: 12px;
  ${actionLinkStyles}
`;

export const DeleteLink = styled.div`
  ${actionLinkStyles}
  &:before {
    position: relative;
    right: 5px;
    left: 5px
    display: inline-block;
  }
  padding-left: 10px;
`;
