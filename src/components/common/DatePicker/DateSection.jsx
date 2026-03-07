import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { times, range } from 'lodash';

import { formatDate, formatDateTimeForAPI } from '../../../utils/dateTime';
import Icon from '../Icon';



const propTypes = {
  withTime: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setDropdownOpen: PropTypes.func.isRequired,
};

const defaultProps = {
  withTime: true,
  value: undefined,
};

const DatePickerDateSection = ({ withTime, value, onChange, setDropdownOpen }) => {
  const [selectedMonth, setSelectedMonth] = useState(moment(value).startOf('month'));

  const handleYearChange = year => {
    setSelectedMonth(moment(selectedMonth).set({ year: Number(year) }));
  };

  const handleMonthChange = addOrSubtract => {
    setSelectedMonth(moment(selectedMonth)[addOrSubtract](1, 'month'));
  };

  const handleDayChange = newDate => {
    const existingHour = value ? moment(value).hour() : '00';
    const existingMinute = value ? moment(value).minute() : '00';

    const newDateWithExistingTime = newDate.set({
      hour: existingHour,
      minute: existingMinute,
    });
    onChange(formatDateTimeForAPI(newDateWithExistingTime));

    if (!withTime) {
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative p-5">
      <Icon type="arrow-left" onClick={() => handleMonthChange('subtract')} />
      <div className="inline-block pl-[7px] font-bold text-[16px]">{formatDate(selectedMonth, 'MMM YYYY')}</div>

      <select
        className="ml-[5px] w-[60px] h-[22px] text-[13px] bg-transparent border-transparent text-gray-500"
        onChange={event => handleYearChange(event.target.value)}
      >
        {generateYearOptions().map(option => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon type="arrow-right" onClick={() => handleMonthChange('add')} />

      <div className="flex flex-wrap pt-[15px] text-center">
        {generateWeekDayNames().map(name => (
          <div className="w-[14.28%] h-[30px] leading-[30px] text-gray-400 text-[13px]" key={name}>{name}</div>
        ))}
        {generateFillerDaysBeforeMonthStart(selectedMonth).map(i => (
          <div className="w-[14.28%] h-[30px] leading-[30px] rounded-[0.475rem] text-[15px]" key={`before-${i}`} />
        ))}
        {generateMonthDays(selectedMonth).map(date => {
          const isToday = moment().isSame(date, 'day');
          const isSelected = moment(value).isSame(date, 'day');

          return (
            <div
              key={date}
              className={`w-[14.28%] h-[30px] leading-[30px] rounded-[0.475rem] text-[15px] cursor-pointer hover:bg-[#f1faff] hover:text-[#009ef7] ${isToday ? 'bg-[#f1faff] text-[#009ef7]' : ''} ${isSelected ? 'bg-[#009ef7] text-white !hover:text-white' : ''}`}
              onClick={() => handleDayChange(date)}
            >
              {formatDate(date, 'D')}
            </div>
          );
        })}
        {generateFillerDaysAfterMonthEnd(selectedMonth).map(i => (
          <div className="w-[14.28%] h-[30px] leading-[30px] rounded-[0.475rem] text-[15px]" key={`after-${i}`} />
        ))}
      </div>
    </div>
  );
};

const currentYear = moment().year();

const generateYearOptions = () => [
  { label: 'Year', value: '' },
  ...times(50, i => ({ label: `${i + currentYear - 10}`, value: `${i + currentYear - 10}` })),
];

const generateWeekDayNames = () => moment.weekdaysMin(true);

const generateFillerDaysBeforeMonthStart = selectedMonth => {
  const count = selectedMonth.diff(moment(selectedMonth).startOf('week'), 'days');
  return range(count);
};

const generateMonthDays = selectedMonth =>
  times(selectedMonth.daysInMonth()).map(i => moment(selectedMonth).add(i, 'days'));

const generateFillerDaysAfterMonthEnd = selectedMonth => {
  const selectedMonthEnd = moment(selectedMonth).endOf('month');
  const weekEnd = moment(selectedMonthEnd).endOf('week');
  const count = weekEnd.diff(selectedMonthEnd, 'days');
  return range(count);
};

DatePickerDateSection.propTypes = propTypes;
DatePickerDateSection.defaultProps = defaultProps;

export default DatePickerDateSection;
