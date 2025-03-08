import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { BaseI18nProvider } from './i18n/Basei18n'

import './styles/style.scss'
import './styles/plugins.scss'
import './styles/style.react.scss'
import './styles/insights.css'

import { AppRoutes } from './routing/AppRoutes'
import { AuthProvider, setupAxios } from './modules/auth'
import { Provider } from 'react-redux';
//import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
//import { createFirestoreInstance } from 'redux-firestore';
import store from './redux/store';

setupAxios(axios)

const queryClient = new QueryClient()
const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BaseI18nProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BaseI18nProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  )
}
