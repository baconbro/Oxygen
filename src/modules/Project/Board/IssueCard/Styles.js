import styled from 'styled-components';
import { color } from '../../../../shared/styles';

export const IssueCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: ${color.backgroundLightest};
  border-radius: 3px;
  box-shadow: ${shadow.dropShadow};
  transition: box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: ${shadow.dropShadowHover};
  }
`;

export const IssueCardTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${color.textDark};
  margin-bottom: 6px;
`;

export const IssueCardMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${color.textMedium};
`;

export const IssueCardType = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;

  i {
    font-size: 12px;
    margin-right: 4px;
  }
`;

export const IssueCardPriority = styled.div`
  display: flex;
  align-items: center;

  i {
    font-size: 12px;
    margin-right: 4px;
  }
`;

export const IssueCardAssignees = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;

  img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-left: -6px;
    border: 2px solid ${color.backgroundLightest};
  }
`;

export const ChecklistProgress = styled.div`
  display: flex;
  align-items: center;
  margin-top: 6px;
  
  span {
    font-size: 11px;
    color: ${color.textMedium};
    margin-left: 6px;
  }
`;

export const ProgressBar = styled.div`
  width: 100px;
  height: 4px;
  background: ${color.backgroundLight};
  border-radius: 2px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background: ${color.success};
  transition: width 0.2s;
`;