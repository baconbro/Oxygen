import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { color } from '../../../utils/styles';
import Icon from '../Icon';

import { StyledButton, Text } from './Styles';

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'secondary', 'empty']),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  iconSize: PropTypes.number,
  disabled: PropTypes.bool,
  isWorking: PropTypes.bool,
  onClick: PropTypes.func,
};

const defaultProps = {
  className: undefined,
  children: undefined,
  variant: 'secondary',
  icon: undefined,
  iconSize: 18,
  disabled: false,
  isWorking: false,
  onClick: () => {},
};

const Button = forwardRef(
  ({ children, variant, icon, iconSize, disabled, isWorking, onClick, className, ...buttonProps }, ref) => {
    const handleClick = () => {
      if (!disabled && !isWorking) {
        onClick();
      }
    };
    //if (className && className.includes(" btn ")){className.concat(' btn')}
    

    return (
      <StyledButton
        {...buttonProps}
        onClick={handleClick}
        variant={variant}
        disabled={disabled || isWorking}
        isWorking={isWorking}
        iconOnly={!children}
        ref={ref}
        className={className}
      >
        {isWorking && <span className='spinner-border spinner-border-sm text-secondary align-middle ms-2' ></span>}

        {!isWorking && icon && typeof icon === 'string' ? (
          <Icon type={icon} size={iconSize} color={getIconColor(variant)} />
        ) : (
          icon
        )}
        {children && <Text withPadding={isWorking || icon}>{children}</Text>}
      </StyledButton>
    );
  },
);

const getIconColor = variant =>
  ['secondary', 'empty'].includes(variant) ? color.textDark : '#fff';

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
