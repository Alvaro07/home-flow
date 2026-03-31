import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { User, Session } from '@supabase/supabase-js'

// Mock mínimo de User para los tests
const mockUser: Partial<User> = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
}

const mockSession: Partial<Session> = {
  user: mockUser as User,
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
}

describe('authStore', () => {
  // Reseteamos el store antes de cada test
  // para que no se contaminen entre sí
  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  it('tiene el estado inicial correcto', () => {
    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.isLoading).toBe(true)
  })

  it('setSession actualiza user y session correctamente', () => {
    const { setSession } = useAuthStore.getState()

    setSession(mockSession as Session)

    const state = useAuthStore.getState()
    expect(state.session).toEqual(mockSession)
    expect(state.user).toEqual(mockUser)
  })

  it('setUser actualiza el usuario', () => {
    useAuthStore.getState().setUser(mockUser as User)

    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('setSession con null limpia user y session', () => {
    // Primero ponemos una sesión
    useAuthStore.getState().setSession(mockSession as Session)

    // Luego la limpiamos
    useAuthStore.getState().setSession(null)

    const state = useAuthStore.getState()
    expect(state.session).toBeNull()
    expect(state.user).toBeNull()
  })

  it('setLoading actualiza isLoading', () => {
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)

    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
  })

  it('reset devuelve el estado inicial', () => {
    // Modificamos el estado
    useAuthStore.getState().setSession(mockSession as Session)
    useAuthStore.getState().setLoading(false)

    // Reseteamos
    useAuthStore.getState().reset()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    // isLoading vuelve a true — es el estado inicial
    expect(state.isLoading).toBe(true)
  })

  describe('selectores', () => {
    it('selectIsAuthenticated devuelve false sin sesión', () => {
      const isAuthenticated = !!useAuthStore.getState().session
      expect(isAuthenticated).toBe(false)
    })

    it('selectIsAuthenticated devuelve true con sesión', () => {
      useAuthStore.getState().setSession(mockSession as Session)
      const isAuthenticated = !!useAuthStore.getState().session
      expect(isAuthenticated).toBe(true)
    })
  })
})
