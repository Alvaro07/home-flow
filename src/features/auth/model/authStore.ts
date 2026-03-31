import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  // El usuario autenticado — null si no hay sesión
  user: User | null
  // La sesión completa — contiene el JWT y metadatos
  session: Session | null
  // True mientras se comprueba si hay sesión al arrancar la app
  // Evita que se muestre el login un instante antes de redirigir
  isLoading: boolean

  // Acciones — siempre junto al estado que modifican
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  // Limpia todo el estado — se llama al hacer logout
  reset: () => void
}

const initialState = {
  user: null,
  session: null,
  isLoading: true, // true por defecto — hasta que se compruebe la sesión
}

export const useAuthStore = create<AuthState>()(
  // devtools nos da el panel de Redux DevTools en el navegador
  // para inspeccionar el estado en tiempo real durante desarrollo
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user: User | null) => {
        set({ user }, false, 'auth/setUser')
      },

      setSession: (session: Session | null) => {
        set({ session, user: session?.user ?? null }, false, 'auth/setSession')
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading }, false, 'auth/setLoading')
      },

      reset: () => {
        set({ ...initialState }, false, 'auth/reset')
      },
    }),
    {
      name: 'AuthStore',
      // Solo activo en desarrollo
      enabled: import.meta.env.DEV,
    },
  ),
)

// Selectores — funciones que extraen partes concretas del estado
// Usarlos en lugar de acceder directamente al store completo
// evita re-renders innecesarios cuando cambia algo no relacionado
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => !!state.session
export const selectIsLoading = (state: AuthState) => state.isLoading
