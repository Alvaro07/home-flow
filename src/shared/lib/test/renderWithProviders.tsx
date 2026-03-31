import type { ReactNode, ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrimeReactProvider } from 'primereact/api'

// QueryClient sin reintentos para que los tests fallen rápido
// Sin esto, un error esperado reintenta 3 veces y el test tarda mucho
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

interface RenderOptions {
  route?: string
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/' }: RenderOptions = {},
): RenderResult => {
  window.history.pushState({}, '', route)

  const testQueryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <PrimeReactProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </PrimeReactProvider>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper })
}
