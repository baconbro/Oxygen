import React from 'react';
import PropTypes from 'prop-types';

import { StyledIcon } from './Styles';

const fontIconCodes = {
  [`bug`]: '\f1dC',
  [`stopwatch`]: '\\e914',
  [`task`]: '\f271',
  [`story`]: '\f4db',
  [`arrow-down`]: '\f128',
  [`arrow-left-circle`]: '\\e917',
  [`arrow-up`]: '\f148',
  [`chevron-down`]: '\\e900',
  [`chevron-left`]: '\\e901',
  [`chevron-right`]: '\\e902',
  [`chevron-up`]: '\\e903',
  [`board`]: '\f44c',
  [`help`]: '\f430',
  [`link`]: '\f28b',
  [`menu`]: '\f5d4',
  [`more`]: '\\e90e',
  [`attach`]: '\\e90d',
  [`plus`]: '\f4fb',
  [`search`]: '\f52a',
  [`issues`]: '\\e908',
  [`settings`]: '\f3e5',
  [`close`]: '\f62a',
  [`feedback`]: '\f253',
  [`trash`]: '\f5de',
  [`github`]: '\\e915',
  [`shipping`]: '\f1c7',
  [`component`]: '\\e91a',
  [`reports`]: '\\e91b',
  [`page`]: '\\e919',
  [`calendar`]: '\f1e2',
  [`arrow-left`]: '\f12f',
  [`arrow-right`]: '\f138',
  [`epic`]: '\f685',
  ['backlog']:'\f477',
  ['roadmap']:'\f17d',
  ['strategy']:'\f514',
  ['theme']:'\f513',
  ['initiative']:'\f512',
  ['capability']:'\f511',
  ['idea']:'\f468',
};

const propTypes = {
  className: PropTypes.string,
  //type: PropTypes.oneOf(Object.keys(fontIconCodes)).isRequired,
  size: PropTypes.number,
  left: PropTypes.number,
  top: PropTypes.number,
};

const defaultProps = {
  className: undefined,
  size: 16,
  left: 0,
  top: 0,
};

const Icon = ({ type, ...iconProps }) => (
  <StyledIcon {...iconProps} data-testid={`icon:${type}`} code={fontIconCodes[type]} />

);

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
