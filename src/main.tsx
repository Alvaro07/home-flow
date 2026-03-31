import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@app/providers/AppProviders'
import { AppRouter } from '@app/router/AppRouter'
import '@app/styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Check your index.html has a <div id="root">')
}

const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
