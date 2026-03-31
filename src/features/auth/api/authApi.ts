import type { Session } from '@supabase/supabase-js'
import { supabase } from '@shared/lib/supabase'

// Tipos propios del dominio — no exponemos tipos internos de Supabase
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthError {
  message: string
  status?: number
}

// Cada función devuelve un resultado explícito en lugar de lanzar
// excepciones. Esto hace que los errores sean parte del tipo y
// obliga al consumidor a manejarlos — no puede ignorarlos.
export type AuthResult<T> = { data: T; error: null } | { data: null; error: AuthError }

export const authApi = {
  // Login con email y password
  signIn: async (credentials: LoginCredentials): Promise<AuthResult<void>> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        data: null,
        error: { message: mapAuthError(error.message), status: error.status },
      }
    }

    return { data: undefined, error: null }
  },

  // Logout — cierra la sesión y limpia el token local
  signOut: async (): Promise<AuthResult<void>> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { data: null, error: { message: error.message } }
    }

    return { data: undefined, error: null }
  },

  // Registro con email y password
  signUp: async (credentials: LoginCredentials): Promise<AuthResult<void>> => {
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        data: null,
        error: { message: mapAuthError(error.message), status: error.status },
      }
    }

    return { data: undefined, error: null }
  },

  // Obtener la sesión actual desde el storage local
  // Supabase la persiste automáticamente en localStorage
  getSession: async (): Promise<AuthResult<Session | null>> => {
    const { data, error } = await supabase.auth.getSession()

    if (error) return { data: null, error: { message: error.message } }
    return { data: data.session, error: null }
  },

  // Suscribirse a cambios de sesión en tiempo real
  // Devuelve el objeto subscription para poder cancelar la suscripción
  onAuthStateChange: (callback: (session: Session | null) => void) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return subscription
  },
}

// Centralizar la traducción de errores de Supabase a mensajes
// legibles por el usuario. Supabase devuelve strings en inglés
// y a veces crípticos — los mapeamos aquí.
const mapAuthError = (message: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Debes confirmar tu email antes de entrar',
    'Too many requests': 'Demasiados intentos. Espera unos minutos',
    'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos',
    'User not found': 'No existe una cuenta con ese email',
    'User already registered': 'Ya existe una cuenta con ese email',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
  }

  return errorMap[message] ?? 'Ha ocurrido un error. Inténtalo de nuevo'
}
