import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Fix for ~ imports in SCSS (node_modules)
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '~bootstrap-icons': path.resolve(__dirname, 'node_modules/bootstrap-icons'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress deprecation warnings from dependencies
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
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
    // Also handle JSX in .js files during build
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          'vendor-query': ['react-query'],
          'vendor-ui': ['react-bootstrap', 'react-beautiful-dnd'],
          'vendor-charts': ['apexcharts', 'react-apexcharts'],
          'vendor-calendar': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/list',
            '@fullcalendar/interaction',
          ],
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
