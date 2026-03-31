import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { PrimeReactProvider } from 'primereact/api'
import { queryClient } from '@shared/lib/queryClient'
import { useSession } from '@features/auth/model/useSession'

// Componente interno que activa el listener de sesión
// Está dentro de QueryClientProvider para poder usar hooks
const SessionProvider = ({ children }: { children: ReactNode }) => {
  useSession()
  return children
}

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider>
        <SessionProvider>{children}</SessionProvider>
      </PrimeReactProvider>
    </QueryClientProvider>
  )
}
