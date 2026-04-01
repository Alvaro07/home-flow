import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { supermarketsApi } from '../api/supermarketsApi'
import { useSupermarkets } from './useSupermarkets'

const mockSupermarket = {
  id: 'sm-1',
  user_id: 'user-1',
  name: 'Mercadona',
  color: '#00a650',
  position: 0,
  is_default: false,
  created_at: '2024-01-01T00:00:00Z',
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useSupermarkets', () => {
  describe('query', () => {
    it('devuelve los supermercados cuando la API tiene éxito', async () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValueOnce({
        data: [mockSupermarket],
        error: null,
      })

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.supermarkets).toEqual([mockSupermarket])
      expect(result.current.error).toBeNull()
    })

    it('devuelve lista vacía mientras carga', () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValueOnce({
        data: [mockSupermarket],
        error: null,
      })

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      expect(result.current.supermarkets).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('expone el error cuando la API falla', async () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error de conexión' },
      })

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.error).not.toBeNull()
    })
  })

  describe('create', () => {
    it('llama a la API con los datos correctos', async () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(supermarketsApi, 'create').mockResolvedValueOnce({
        data: mockSupermarket,
        error: null,
      })

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.create.mutateAsync({ name: 'Mercadona' })
      })

      expect(spy).toHaveBeenCalledWith({ name: 'Mercadona' })
    })

    it('expone error cuando la mutación falla', async () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      vi.spyOn(supermarketsApi, 'create').mockResolvedValueOnce({
        data: null,
        error: { message: 'Ya existe un supermercado con ese nombre' },
      })

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.create.mutateAsync({ name: 'Mercadona' }).catch(() => {})
      })

      await waitFor(() => { expect(result.current.create.isError).toBe(true) })
    })
  })

  describe('remove', () => {
    it('llama a la API con el id correcto', async () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(supermarketsApi, 'remove').mockResolvedValueOnce({
        data: undefined,
        error: null,
      })

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.remove.mutateAsync('sm-1')
      })

      expect(spy).toHaveBeenCalledWith('sm-1')
    })
  })

  describe('reorder', () => {
    it('llama a la API con el payload correcto', async () => {
      vi.spyOn(supermarketsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(supermarketsApi, 'reorder').mockResolvedValueOnce({
        data: undefined,
        error: null,
      })

      const payload = [
        { id: 'sm-1', position: 0 },
        { id: 'sm-2', position: 1 },
      ]

      const { result } = renderHook(() => useSupermarkets(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.reorder.mutateAsync(payload)
      })

      expect(spy).toHaveBeenCalledWith(payload)
    })
  })
})
