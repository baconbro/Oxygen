import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { formatDate, formatDateTime } from '../../../utils/dateTime';
import useOnOutsideClick from '../../../hooks/onOutsideClick';
import Input from '../Input';

import DateSection from './DateSection';
import TimeSection from './TimeSection';

const propTypes = {
  className: PropTypes.string,
  withTime: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const defaultProps = {
  className: undefined,
  withTime: true,
  value: undefined,
};

const DatePicker = ({ className, withTime, value, onChange, ...inputProps }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const $containerRef = useRef();

  useOnOutsideClick($containerRef, isDropdownOpen, () => setDropdownOpen(false));

  const handleClearDate = (e) => {
    e.stopPropagation();
    onChange("");
  };

  // Initialize with current date when value is empty to allow DateSection to work properly
  const ensureValidDateValue = (val) => {
    if (!val || val === "") {
      return new Date().toISOString();
    }
    return val;
  };

  return (
    <div className="relative" ref={$containerRef}>
      <div className="position-relative w-100">
        <Input
          icon="calendar"
          {...inputProps}
          className={className}
          autoComplete="off"
          value={getFormattedInputValue(value, withTime)}
          onClick={() => setDropdownOpen(true)}
          hasRightIcon={!!value && value !== ""}
        />
        {!!value && value !== "" && (
          <i
            className="bi bi-x-circle position-absolute"
            style={{
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#6c757d'
            }}
            onClick={handleClearDate}
          ></i>
        )}
      </div>
      {isDropdownOpen && (
        <div className={`absolute z-50 top-[130%] right-0 bg-white rounded shadow-lg ${withTime ? "w-[360px] pr-[90px]" : "w-[270px]"}`}>
          <DateSection
            withTime={withTime}
            value={ensureValidDateValue(value)}
            onChange={onChange}
            setDropdownOpen={setDropdownOpen}
          />
          {withTime && (
            <TimeSection
              value={ensureValidDateValue(value)}
              onChange={onChange}
              setDropdownOpen={setDropdownOpen}
            />
          )}
        </div>
      )}
    </div>
  );
};

const getFormattedInputValue = (value, withTime) => {
  if (!value) return '';
  return withTime ? formatDateTime(value) : formatDate(value);
};

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default DatePicker;
