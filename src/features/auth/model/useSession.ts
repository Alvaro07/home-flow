import { useEffect } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from './authStore'

export const useSession = () => {
  const setSession = useAuthStore((state) => state.setSession)
  const setLoading = useAuthStore((state) => state.setLoading)
  const reset = useAuthStore((state) => state.reset)

  useEffect(() => {
    // Función async definida dentro del efecto — patrón correcto
    // useEffect no puede ser async directamente porque debe devolver
    // undefined o una función de cleanup, nunca una Promise
    const initSession = async () => {
      try {
        const result = await authApi.getSession()
        if (result.error) {
          console.error('Error initializing session:', result.error.message)
          reset()
        } else {
          setSession(result.data)
        }
      } catch (error) {
        // Para errores inesperados no capturados por authApi
        console.error('Error initializing session:', error)
        reset()
      } finally {
        // finally garantiza que isLoading pasa a false siempre,
        // tanto si hay sesión como si hay error — sin esto la app
        // podría quedarse en estado de carga indefinidamente
        setLoading(false)
      }
    }

    // void le dice al linter que la Promise es intencionalmente
    // no awaited — el manejo real del error está en el try/catch
    void initSession()

    // Listener que mantiene el store sincronizado con Supabase
    // en tiempo real durante toda la vida de la app:
    // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
    const subscription = authApi.onAuthStateChange((session) => {
      setSession(session)
    })

    // Cleanup — cancelar la suscripción cuando el componente
    // que monta este hook se desmonta, evitando memory leaks
    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setLoading, reset])
}
