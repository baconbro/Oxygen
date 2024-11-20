import styled from 'styled-components';

import { color, font, mixin } from '../shared/utils/styles';

import { Button } from '../../../components/common';

export const List = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 5px;
  min-height: 400px;
  width: -webkit-fill-available;
  border-radius: 3px;
  background: ${color.backgroundLightest};
  min-width: 170px;
`;

export const Title = styled.div`
  padding: 13px 10px 17px;
  text-transform: uppercase;
  color: ${color.textMedium};
  ${font.size(12.5)};
  ${mixin.truncateText}
`;

export const IssuesCount = styled.span`
  text-transform: lowercase;
  ${font.size(13)};
`;

export const Issues = styled.div`
  height: 100%;
  padding: 0 5px;
`;



export const Actions = styled.div`
  display: flex;
  padding-top: 10px;
`;

export const FormButton = styled(Button)`
  margin-right: 6px;
`;
