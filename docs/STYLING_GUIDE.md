# Oxygen Styling Guide

## Overview

Oxygen uses a comprehensive SCSS-based styling system with support for light and dark themes. This document outlines the styling architecture, variables, and usage patterns.

## Styling Architecture

The styling system is organized into:

1. **Core Styles**: Base styling components, variables, and mixins
2. **Layout Styles**: Styles for layout components
3. **Theme Modes**: Support for light and dark themes
4. **Vendor Styles**: Customized styles for third-party libraries

## Directory Structure

```
/src/styles/
├── core/
│   ├── base/
│   ├── components/
│   │   ├── _variables.scss
│   │   ├── _root.scss
│   │   └── ...
│   ├── layout/
│   └── vendors/
├── layout/
│   ├── aside/
│   │   ├── _base.scss
│   │   ├── _menu.scss
│   │   └── ...
│   ├── _root.scss
│   └── _variables.scss
```

## Theme System

Oxygen supports light and dark themes through CSS variables and theme mixins:

```scss
// Theme mixins
@include theme-light() {
  // Light theme styles
}

@include theme-dark() {
  // Dark theme styles
}
```

CSS variables are defined in `_root.scss` and used throughout the application:

```scss
:root {
  // Root CSS variables
  --xgn-primary: #{$primary};
  --xgn-primary-active: #{$primary-active};
  // ...more variables
}
```

## Color System

Oxygen uses a semantic color system with primary, secondary, and contextual colors:

### Primary Colors

- `$primary`: Main brand color
- `$primary-active`: Active state of primary color
- `$primary-light`: Light variant of primary color
- `$primary-inverse`: Inverse color for text on primary backgrounds

### Contextual Colors

- `$success`: Success states (green)
- `$warning`: Warning states (orange)
- `$danger`: Error states (red)
- `$info`: Informational states (blue)

### Grays

A comprehensive grayscale palette is available from `$gray-100` to `$gray-900` with dark mode variants (`$gray-100-dark` to `$gray-900-dark`).

## Typography

Typography is controlled through variables:

```scss
$font-family-sans-serif: "Poppins", Helvetica, sans-serif;
$font-size-base: 1rem;
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 600;
$font-weight-bolder: 700;
```

## Layout Components

### Card

```scss
.card {
  background-color: var(--xgn-card-bg);
  box-shadow: var(--xgn-card-box-shadow);
  border-radius: var(--xgn-card-border-radius);
}
```

### Progress Bar

```scss
.progress {
  background-color: var(--xgn-progress-bg);
}

.progress-bar {
  background-color: var(--xgn-primary);
}
```

### Badges

```scss
.badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 500;
  border-radius: 0.25rem;
}

.badge-light {
  background-color: var(--xgn-light);
  color: var(--xgn-dark);
}

.badge-primary {
  background-color: var(--xgn-primary);
  color: var(--xgn-primary-inverse);
}
```

## Menu Components

```scss
.menu {
  display: flex;
  flex-direction: column;
}

.menu-item {
  // Menu item styles
}

.menu-link {
  display: flex;
  align-items: center;
  padding: $menu-link-padding-y $menu-link-padding-x;
  border-radius: $menu-link-border-radius;
}
```

## Button Styles

```scss
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 0.475rem;
  padding: 0.75rem 1.5rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-primary {
  background-color: var(--xgn-primary);
  color: var(--xgn-primary-inverse);
}

.btn-light {
  background-color: var(--xgn-light);
  color: var(--xgn-dark);
}
```

## Utility Classes

### Spacing

Oxygen uses a spacing system based on the `$spacer` variable:

```scss
$spacer: 1rem;
$gutters: (
  0: 0rem,
  1: ($spacer * .25),  // 3.5px
  2: ($spacer * .5),   // 7px
  // ...more spacers
);
```

These generate utility classes such as:
- `p-1`: Padding of 0.25rem
- `m-2`: Margin of 0.5rem
- `mt-3`: Margin-top of 0.75rem
- `px-4`: Padding-left and padding-right of 1rem

### Text Utilities

- `.text-primary`: Primary text color
- `.fw-bold`: Bold font weight
- `.fs-6`: Font size level 6
- `.text-nowrap`: Prevents text wrapping

## CSS Functions and Mixins

### The `get()` Function

Used to access nested SCSS map values:

```scss
$aside-config: (
  width: 265px,
  bg-color: $white,
  bg-color-dark: #1e1e2d
);

.aside {
  width: get($aside-config, width);
  background-color: get($aside-config, bg-color);
}
```

### Theme Mode Mixins

```scss
@include theme-light() {
  .theme-dark-show {
    display: none !important;		
  }
}

@include theme-dark() {
  .theme-light-show {
    display: none !important;		
  }
}
```

## Third-Party Integration

### DataTables Styling

```scss
table.dataTable {
  width: 100% !important;
  margin: 0 !important;
}

table.dataTable > thead .sorting:after {
  opacity: 1;
  @include svg-bg-icon(arrow-top, var(--xgn-text-muted));
}
```

### Quill Editor Styling

```scss
.ql-toolbar {
  border: 1px solid var(--xgn-border-color);
  @include border-top-radius($border-radius);
}

.ql-container {
  background-color: var(--xgn-input-bg);
  border: 1px solid var(--xgn-gray-200);
  border-top: 0;
}
```

## Best Practices

1. **Use CSS Variables**: Prefer CSS variables for theme-aware styles
2. **Follow Naming Conventions**: Use BEM naming convention for custom components
3. **Responsive Design**: Use the responsive breakpoints for adaptive layouts
4. **Don't Overwrite Core Styles**: Extend rather than overwrite core styles
5. **Keep Specificity Low**: Avoid deep nesting and unnecessary specificity
6. **Use Utility Classes**: Leverage utility classes for common styling needs
7. **Theme Compatibility**: Ensure all styles work in both light and dark themes
