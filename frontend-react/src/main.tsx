import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App'
import { queryClient } from './lib/query-client'
import { SessionBootstrap } from './features/auth/components/SessionBootstrap'
import { AppToast, WelcomeToast } from './components/feedback/WelcomeToast'
import { AppErrorBoundary } from './routes/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionBootstrap><AppErrorBoundary><App /></AppErrorBoundary><WelcomeToast /><AppToast /></SessionBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
