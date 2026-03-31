import { Navigate } from 'react-router-dom'
import { LoginForm } from '@features/auth/ui/LoginForm'
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@features/auth'
import { ROUTES } from '@app/router/routes'

export const LoginPage = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isLoading = useAuthStore(selectIsLoading)

  // Mientras carga la sesión inicial no renderizamos nada
  // evita el flash del formulario antes de redirigir
  if (isLoading) return null

  // Si ya está autenticado lo mandamos al dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <LoginForm />
}
