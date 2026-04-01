import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@features/auth'
import { AppHeader } from '@widgets/AppHeader/AppHeader'
import { ROUTES } from '@app/router/routes'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isLoading = useAuthStore(selectIsLoading)
  const location = useLocation()

  // Mientras se comprueba la sesión inicial mostramos nada
  // Evita el flash de login antes de redirigir al dashboard
  // si el usuario ya tenía sesión activa
  if (isLoading) {
    return null
  }

  // Si no está autenticado redirigimos al login
  // Guardamos la ruta intentada en el state del navigate
  // para poder redirigir de vuelta después del login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  )
}
