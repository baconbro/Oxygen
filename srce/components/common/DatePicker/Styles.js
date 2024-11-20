import styled, { css } from 'styled-components';

import { color, font, mixin, zIndexValues } from '../../../utils/styles';

export const StyledDatePicker = styled.div`
  position: relative;
`;

export const Dropdown = styled.div`
  z-index: ${zIndexValues.dropdown};
  position: absolute;
  top: 130%;
  right: 0;
  width: 270px;
  border-radius: 3px;
  background: #fff;
  ${mixin.boxShadowDropdown}
  ${props =>
    props.withTime &&
    css`
      width: 360px;
      padding-right: 90px;
    `}
`;

export const DateSection = styled.div`
  position: relative;
  padding: 20px;
`;

export const SelectedMonthYear = styled.div`
  display: inline-block;
  padding-left: 7px;
  ${font.bold}
  ${font.size(16)}
`;

export const YearSelect = styled.select`
  margin-left: 5px;
  width: 60px;
  height: 22px;
  ${font.size(13)}
  background-color: transparent;
  border-color: transparent;
  color: #5e6278;
`;

export const PrevNextIcons = styled.div`
  position: absolute;
  top: 12px;
  right: 19px;
  i {
    padding: 7px 5px 4px;
    font-size: 22px;
    color: ${color.textLight};
    ${mixin.clickable}
    &:hover {
      color: ${color.textDarkest};
    }
  }
`;

export const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-top: 15px;
  text-align: center;
`;

export const DayName = styled.div`
  width: 14.28%;
  height: 30px;
  line-height: 30px;
  color: ${color.textLight};
  ${font.size(13)}
`;

export const Day = styled.div`
  width: 14.28%;
  height: 30px;
  line-height: 30px;
  border-radius: 0.475rem;
  ${font.size(15)}
  ${props => !props.isFiller && hoverStyles}
  ${props => props.isToday && today}
  ${props => props.isSelected && selectedStyles}
`;

export const TimeSection = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 90px;
  padding: 5px 0;
  border-left: 1px solid ${color.borderLight};
  ${mixin.scrollableY}
`;

export const Time = styled.div`
  padding: 5px 0 5px 20px;
  ${font.size(14)}
  ${props => !props.isFiller && hoverStyles}
  ${props => props.isSelected && selectedStyles}
`;

const hoverStyles = css`
  ${mixin.clickable}
  &:hover {
    background: #f1faff!important;
color: #009ef7!important;
  }
`;

const selectedStyles = css`
background-color: #009ef7!important;
color: #fff!important;
`;
const today = css`
background: #f1faff!important;
color: #009ef7!important;
`;
