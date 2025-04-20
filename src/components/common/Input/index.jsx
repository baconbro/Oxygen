import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { StyledInput, InputElement, StyledIcon, StyledRightIcon } from './Styles';

const propTypes = {
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  rightIcon: PropTypes.string,
  onRightIconClick: PropTypes.func,
  invalid: PropTypes.bool,
  filter: PropTypes.instanceOf(RegExp),
  onChange: PropTypes.func,
};

const defaultProps = {
  className: undefined,
  value: undefined,
  icon: undefined,
  rightIcon: undefined,
  onRightIconClick: undefined,
  invalid: false,
  filter: undefined,
  onChange: () => {},
};

const Input = forwardRef(({ icon, rightIcon, onRightIconClick, className, filter, onChange, ...inputProps }, ref) => {
  const handleChange = event => {
    if (!filter || filter.test(event.target.value)) {
      onChange(event.target.value, event);
    }
  };

  return (
    <span >
      {icon && <StyledIcon type={icon} size={15} />}
      <InputElement 
        {...inputProps} 
        onChange={handleChange} 
        hasIcon={!!icon} 
        hasRightIcon={!!rightIcon} 
        ref={ref} 
        className={`form-control ${className || ''}`}
      />
      {rightIcon && <StyledRightIcon type={rightIcon} size={15} onClick={onRightIconClick} />}
    </span>
  );
});

Input.propTypes = propTypes;
Input.defaultProps = defaultProps;

export default Input;
