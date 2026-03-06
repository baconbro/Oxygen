/**
 * Environment variable utilities
 * Provides a unified interface for accessing environment variables
 * that works with both Vite (import.meta.env) and legacy CRA (process.env)
 */

// Helper to get environment variable with Vite or CRA fallback
const getEnvVar = (viteKey: string, craKey: string): string => {
  // Try Vite first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteValue = import.meta.env[viteKey as keyof ImportMetaEnv]
    if (viteValue) return viteValue
  }

  // Fallback to process.env for any remaining CRA patterns
  if (typeof process !== 'undefined' && process.env) {
    const craValue = (process.env as Record<string, string | undefined>)[craKey]
    if (craValue) return craValue
  }

  return ''
}

// Environment configuration object
export const env = {
  // Firebase configuration
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'REACT_APP_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID', 'REACT_APP_FIREBASE_APP_ID'),
    measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', 'REACT_APP_FIREBASE_MEASUREMENT_ID'),
  },

  // API configuration
  apiUrl: getEnvVar('VITE_API_URL', 'REACT_APP_API_URL'),

  // App configuration
  i18nConfigKey: getEnvVar('VITE_I18N_CONFIG_KEY', 'REACT_APP_I18N_CONFIG_KEY') || 'i18nConfig',
  layoutConfigKey: getEnvVar('VITE_BASE_LAYOUT_CONFIG_KEY', 'REACT_APP_BASE_LAYOUT_CONFIG_KEY') || 'LayoutConfig',

  // Environment checks
  isDevelopment: import.meta.env?.DEV ?? process.env.NODE_ENV === 'development',
  isProduction: import.meta.env?.PROD ?? process.env.NODE_ENV === 'production',
  mode: import.meta.env?.MODE ?? process.env.NODE_ENV ?? 'development',
} as const

export default env
