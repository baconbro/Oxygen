import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BaseI18nProvider } from './i18n/Basei18n'
import { queryClient } from './lib/queryClient'

import './styles/style.scss'
import './styles/plugins.scss'
import './styles/style.react.scss'
import './styles/insights.css'

import { AppRoutes } from './routing/AppRoutes'
import { AuthProvider, setupAxios } from './modules/auth'

setupAxios(axios)

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <BaseI18nProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BaseI18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
