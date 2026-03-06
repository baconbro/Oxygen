import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Include .js files that contain JSX
      include: '**/*.{jsx,tsx,js}',
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Fix for ~ imports in SCSS (node_modules)
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '~bootstrap-icons': path.resolve(__dirname, 'node_modules/bootstrap-icons'),
      '~animate.css': path.resolve(__dirname, 'node_modules/animate.css'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress deprecation warnings from dependencies
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'if-function', 'abs-percent', 'function-units'],
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Handle JSX in .js files (common in older React projects)
      loader: {
        '.js': 'jsx',
      },
    },
  },
  esbuild: {
    // Handle JSX in .js files during build
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    // Handle .js files with JSX during build
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'vendor-state'
            }
            if (id.includes('fullcalendar')) {
              return 'vendor-calendar'
            }
            if (id.includes('apexcharts')) {
              return 'vendor-charts'
            }
          }
        },
      },
    },
  },
  // Handle environment variables migration from CRA
  define: {
    // Support for process.env in legacy code during migration
    'process.env': {},
  },
})
