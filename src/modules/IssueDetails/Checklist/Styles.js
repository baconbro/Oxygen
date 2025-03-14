import styled from 'styled-components';
import { color, font } from '../../../utils/styles';

export const ChecklistContainer = styled.div`
  margin: 16px 0;
  padding: 10px 0;
`;

export const ChecklistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const ChecklistProgress = styled.div`
  display: flex;
  align-items: center;
`;

export const ChecklistProgressBar = styled.div`
  width: 120px;
  height: 6px;
  background: ${color.backgroundLight};
  border-radius: 3px;
  overflow: hidden;
  margin-right: 8px;
  
  > div {
    height: 100%;
    background: ${color.success};
    transition: width 0.2s;
  }
`;

export const ChecklistProgressText = styled.span`
  color: ${color.textMedium};
  font-size: 12px;
`;

export const ChecklistItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 6px 0;
  margin: 2px 0;
  border-radius: 3px;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    margin-top: 3px;
    cursor: pointer;
  }

  &:hover {
    background: ${color.backgroundLightest};
  }
`;

export const ChecklistItemContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ChecklistItemText = styled.span`
  color: ${props => props.completed ? color.textLight : color.textDarkest};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
`;

export const ChecklistControls = styled.div`
  visibility: hidden;
  
  ${ChecklistItem}:hover & {
    visibility: visible;
  }
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: ${color.textMedium};
    padding: 2px 6px;
    
    &:hover {
      color: ${color.primary};
    }
  }
`;

export const ChecklistAddItem = styled.div`
  display: flex;
  margin-top: 10px;
  
  button {
    margin-left: 8px;
    padding: 6px 12px;
    background: ${color.primary};
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

export const ChecklistInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid ${color.borderLightest};
  color: ${color.textLight};
  border-radius: 3px;
  
  &:focus {
    outline: none;
    border-color: ${color.borderInputFocus};
  }
`;

export const DragHandle = styled.div`
  display: flex;
  align-items: center;
  margin-right: 6px;
  color: ${color.textLight};
  cursor: grab;
  
  i {
    font-size: 14px;
  }
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    color: ${color.textMedium};
  }
`;
