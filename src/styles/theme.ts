/**
 * Theme Configuration
 *
 * This file maps the existing CSS variables (xgn-* prefix) to a TypeScript
 * configuration for use with both Tailwind CSS and runtime theme switching.
 *
 * The CSS variables are defined in SCSS and exposed via :root in the DOM.
 * Tailwind is configured to use these variables directly.
 */

export const themeColors = {
  // Primary colors
  primary: {
    DEFAULT: 'var(--xgn-primary)',
    active: 'var(--xgn-primary-active)',
    light: 'var(--xgn-primary-light)',
    inverse: 'var(--xgn-primary-inverse)',
  },
  // Secondary colors
  secondary: {
    DEFAULT: 'var(--xgn-secondary)',
    active: 'var(--xgn-secondary-active)',
    light: 'var(--xgn-secondary-light)',
    inverse: 'var(--xgn-secondary-inverse)',
  },
  // Success colors
  success: {
    DEFAULT: 'var(--xgn-success)',
    active: 'var(--xgn-success-active)',
    light: 'var(--xgn-success-light)',
    inverse: 'var(--xgn-success-inverse)',
  },
  // Info colors
  info: {
    DEFAULT: 'var(--xgn-info)',
    active: 'var(--xgn-info-active)',
    light: 'var(--xgn-info-light)',
    inverse: 'var(--xgn-info-inverse)',
  },
  // Warning colors
  warning: {
    DEFAULT: 'var(--xgn-warning)',
    active: 'var(--xgn-warning-active)',
    light: 'var(--xgn-warning-light)',
    inverse: 'var(--xgn-warning-inverse)',
  },
  // Danger colors
  danger: {
    DEFAULT: 'var(--xgn-danger)',
    active: 'var(--xgn-danger-active)',
    light: 'var(--xgn-danger-light)',
    inverse: 'var(--xgn-danger-inverse)',
  },
  // Gray scale
  gray: {
    100: 'var(--xgn-gray-100)',
    200: 'var(--xgn-gray-200)',
    300: 'var(--xgn-gray-300)',
    400: 'var(--xgn-gray-400)',
    500: 'var(--xgn-gray-500)',
    600: 'var(--xgn-gray-600)',
    700: 'var(--xgn-gray-700)',
    800: 'var(--xgn-gray-800)',
    900: 'var(--xgn-gray-900)',
  },
} as const

export const themeSpacing = {
  page: {
    bg: 'var(--xgn-page-bg)',
  },
  card: {
    bg: 'var(--xgn-card-bg)',
    borderColor: 'var(--xgn-card-border-color)',
  },
  input: {
    bg: 'var(--xgn-input-bg)',
    borderColor: 'var(--xgn-input-border-color)',
  },
} as const

export const themeBorderRadius = {
  DEFAULT: 'var(--xgn-border-radius, 0.475rem)',
  sm: 'var(--xgn-border-radius-sm, 0.425rem)',
  lg: 'var(--xgn-border-radius-lg, 0.625rem)',
} as const

export const themeBoxShadow = {
  sm: 'var(--xgn-box-shadow-sm)',
  DEFAULT: 'var(--xgn-box-shadow)',
  lg: 'var(--xgn-box-shadow-lg)',
} as const

/**
 * Default color values (light mode)
 * These are the raw hex values that CSS variables resolve to.
 * Useful for reference and for creating new components.
 */
export const defaultColors = {
  primary: '#3699FF',
  primaryActive: '#187DE4',
  primaryLight: '#F1FAFF',

  secondary: '#E4E6EF',
  secondaryActive: '#B5B5C3',

  success: '#1BC5BD',
  successActive: '#0BB7AF',
  successLight: '#C9F7F5',

  info: '#8950FC',
  infoActive: '#7337EE',
  infoLight: '#EEE5FF',

  warning: '#FFA800',
  warningActive: '#EE9D01',
  warningLight: '#FFF4DE',

  danger: '#F64E60',
  dangerActive: '#EE2D41',
  dangerLight: '#FFE2E5',

  white: '#ffffff',
  black: '#000000',

  gray100: '#f5f8fa',
  gray200: '#eff2f5',
  gray300: '#E4E6EF',
  gray400: '#B5B5C3',
  gray500: '#A1A5B7',
  gray600: '#7E8299',
  gray700: '#5E6278',
  gray800: '#3F4254',
  gray900: '#181C32',
} as const

/**
 * Dark mode color values
 * These values are used when data-bs-theme="dark" is set.
 */
export const darkModeColors = {
  gray100: '#1b1b29',
  gray200: '#2B2B40',
  gray300: '#323248',
  gray400: '#474761',
  gray500: '#565674',
  gray600: '#6D6D80',
  gray700: '#92929F',
  gray800: '#CDCDDE',
  gray900: '#FFFFFF',

  bodyBg: '#1e1e2d',
} as const

/**
 * Helper to get a color with opacity
 */
export function withOpacity(
  cssVar: string,
  opacity: number
): string {
  return `color-mix(in srgb, ${cssVar} ${opacity * 100}%, transparent)`
}

/**
 * Common z-index values used in the app
 */
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

export type ThemeColor = keyof typeof themeColors
export type GrayScale = keyof typeof themeColors.gray
