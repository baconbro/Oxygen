import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-bs-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Prefix to avoid conflicts with Bootstrap during migration (Removed to allow Shadcn UI base styles)
  theme: {
    extend: {
      colors: {
        // Map to existing CSS variables for smooth migration
        border: 'var(--xgn-border-color)',
        input: 'var(--xgn-input-bg)',
        ring: 'var(--xgn-primary)',
        background: 'var(--xgn-page-bg)',
        foreground: 'var(--xgn-text-color)',
        card: {
          DEFAULT: 'var(--xgn-card-bg)',
          foreground: 'var(--xgn-text-color)',
        },
        primary: {
          DEFAULT: 'var(--xgn-primary)',
          foreground: '#ffffff',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'var(--xgn-secondary)',
          foreground: 'var(--xgn-secondary-inverse)',
        },
        success: {
          DEFAULT: 'var(--xgn-success)',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: 'var(--xgn-warning)',
          foreground: '#000000',
        },
        danger: {
          DEFAULT: 'var(--xgn-danger)',
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: 'var(--xgn-info)',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'var(--xgn-gray-200)',
          foreground: 'var(--xgn-gray-600)',
        },
        accent: {
          DEFAULT: 'var(--xgn-gray-100)',
          foreground: 'var(--xgn-gray-900)',
        },
      },
      borderRadius: {
        lg: 'var(--xgn-border-radius, 0.475rem)',
        md: 'calc(var(--xgn-border-radius, 0.475rem) - 2px)',
        sm: 'calc(var(--xgn-border-radius, 0.475rem) - 4px)',
      },
      fontFamily: {
        sans: ['var(--bs-body-font-family)', 'Inter', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        sm: 'var(--xgn-box-shadow-sm)',
        DEFAULT: 'var(--xgn-box-shadow)',
        lg: 'var(--xgn-box-shadow-lg)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
