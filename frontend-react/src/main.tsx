import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App'
import { queryClient } from './lib/query-client'
import { SessionBootstrap } from './features/auth/components/SessionBootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionBootstrap><App /></SessionBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
