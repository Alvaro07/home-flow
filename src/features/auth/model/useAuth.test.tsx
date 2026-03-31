import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { useAuth } from './useAuth'

const wrapper = ({ children }: { children: ReactNode }) => <BrowserRouter>{children}</BrowserRouter>

describe('useAuth', () => {
  describe('logout', () => {
    it('completa sin error cuando signOut tiene éxito', async () => {
      vi.spyOn(authApi, 'signOut').mockResolvedValueOnce({ data: undefined, error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('expone el error si signOut falla', async () => {
      vi.spyOn(authApi, 'signOut').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error al cerrar sesión' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Error al cerrar sesión')
    })
  })

  describe('clearError', () => {
    it('limpia el error existente', async () => {
      vi.spyOn(authApi, 'signOut').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error al cerrar sesión' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
