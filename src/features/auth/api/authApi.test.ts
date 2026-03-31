import { describe, it, expect, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import type { Session, AuthError, Subscription } from '@supabase/supabase-js'
import { server } from '@shared/lib/test/server'
import { supabase } from '@shared/lib/supabase'
import { authApi } from './authApi'

// URL base de Supabase — la cogemos del entorno
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

describe('authApi', () => {
  describe('signIn', () => {
    it('devuelve data sin error cuando las credenciales son correctas', async () => {
      // Definimos el handler para esta petición concreta
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: 9999999999,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'user-id',
              aud: 'authenticated',
              role: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: '2023-01-01T00:00:00Z',
              app_metadata: {},
              user_metadata: {},
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          })
        }),
      )

      const result = await authApi.signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeUndefined()
    })

    it('devuelve error mapeado cuando las credenciales son incorrectas', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error: 'invalid_grant', error_description: 'Invalid login credentials' },
            { status: 400 },
          )
        }),
      )

      const result = await authApi.signIn({
        email: 'test@example.com',
        password: 'wrong-password',
      })

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      // Verificamos que el mensaje está traducido
      expect(result.error?.message).toBe('Email o contraseña incorrectos')
    })

    it('devuelve mensaje genérico para errores no mapeados', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error: 'server_error', error_description: 'Something unexpected' },
            { status: 500 },
          )
        }),
      )

      const result = await authApi.signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error?.message).toBe('Ha ocurrido un error. Inténtalo de nuevo')
    })
  })

  describe('signOut', () => {
    it('devuelve data sin error al cerrar sesión correctamente', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return new HttpResponse(null, { status: 204 })
        }),
      )

      const result = await authApi.signOut()

      expect(result.error).toBeNull()
    })

    it('devuelve error si el signOut falla', async () => {
      const signOutError = { message: 'Sign out error', name: 'AuthApiError', status: 500 } as unknown as AuthError
      vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: signOutError })

      const result = await authApi.signOut()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Sign out error')
    })
  })

  describe('getSession', () => {
    it('devuelve la sesión cuando existe', async () => {
      const mockSession = { access_token: 'mock-token', user: { id: 'user-id', email: 'test@example.com' } } as unknown as Session
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      const result = await authApi.getSession()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSession)
    })

    it('devuelve error si falla la recuperación de sesión', async () => {
      const sessionError = { message: 'Session error', name: 'AuthApiError', status: 500 } as unknown as AuthError
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: sessionError,
      })

      const result = await authApi.getSession()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Session error')
    })
  })

  describe('onAuthStateChange', () => {
    it('registra el callback y devuelve la suscripción', () => {
      const mockUnsubscribe = vi.fn()
      const mockSubscription = { unsubscribe: mockUnsubscribe } as unknown as Subscription
      const spy = vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValueOnce({
        data: { subscription: mockSubscription },
      })

      const callback = vi.fn()
      const subscription = authApi.onAuthStateChange(callback)

      expect(spy).toHaveBeenCalled()
      expect(subscription.unsubscribe).toBe(mockUnsubscribe)
    })
  })
})
