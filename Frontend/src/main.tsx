import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './realtime/SocketProvider'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
})

import { SEOProvider } from './context/SEOContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SEOProvider>
              <SocketProvider>
                <App />
              </SocketProvider>
            </SEOProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>

      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </ErrorBoundary>
)
