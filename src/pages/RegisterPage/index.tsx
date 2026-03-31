import { Navigate } from 'react-router-dom'
import { RegisterForm } from '@features/auth/ui/RegisterForm'
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@features/auth'
import { ROUTES } from '@app/router/routes'

export const RegisterPage = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isLoading = useAuthStore(selectIsLoading)

  if (isLoading) return null

  // Si ya está autenticado lo mandamos al dashboard
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <RegisterForm />
}
