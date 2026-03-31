import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { ROUTES } from '@app/router/routes'
import type { LoginCredentials } from '../api/authApi'

interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  register: (credentials: LoginCredentials) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await authApi.signIn(credentials)
        if (result.error) {
          setError(result.error.message)
          return
        }
        await navigate(ROUTES.DASHBOARD, { replace: true })
      } finally {
        setIsLoading(false)
      }
    },
    [navigate],
  )

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authApi.signOut()
      if (result.error) {
        setError(result.error.message)
      }
      // El store se actualiza automáticamente vía onAuthStateChange
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await authApi.signUp(credentials)
        if (result.error) {
          setError(result.error.message)
          return
        }
        await navigate(ROUTES.LOGIN, {
          replace: true,
          state: { registered: true },
        })
      } finally {
        setIsLoading(false)
      }
    },
    [navigate],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    login,
    logout,
    register,
    isLoading,
    error,
    clearError,
  }
}
