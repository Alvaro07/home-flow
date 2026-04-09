import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { dishesApi } from '../api/dishesApi'
import { useDishes } from './useDishes'

const mockDish = {
  id: 'dish-1',
  name: 'Paella',
  notes: 'Con marisco',
  created_at: '2024-01-01T00:00:00Z',
  tags: ['arroz', 'marisco'],
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

describe('useDishes', () => {
  describe('query', () => {
    it('devuelve los platos cuando la API tiene éxito', async () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValueOnce({ data: [mockDish], error: null })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.dishes).toEqual([mockDish])
      expect(result.current.error).toBeNull()
    })

    it('devuelve lista vacía mientras carga', () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValueOnce({ data: [mockDish], error: null })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      expect(result.current.dishes).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('expone el error cuando la API falla', async () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error de conexión' },
      })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.error).not.toBeNull()
    })
  })

  describe('create', () => {
    it('llama a la API con los datos correctos', async () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(dishesApi, 'create').mockResolvedValueOnce({ data: mockDish, error: null })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.create.mutateAsync({ name: 'Paella', tags: ['arroz'] })
      })

      expect(spy).toHaveBeenCalledWith({ name: 'Paella', tags: ['arroz'] })
    })

    it('expone error cuando la mutación falla', async () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValue({ data: [], error: null })
      vi.spyOn(dishesApi, 'create').mockResolvedValueOnce({
        data: null,
        error: { message: 'Ya existe un plato con ese nombre' },
      })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.create.mutateAsync({ name: 'Paella' }).catch(() => {})
      })

      await waitFor(() => { expect(result.current.create.isError).toBe(true) })
    })
  })

  describe('update', () => {
    it('llama a la API con el id y los datos correctos', async () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(dishesApi, 'update').mockResolvedValueOnce({
        data: { ...mockDish, name: 'Paella valenciana' },
        error: null,
      })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.update.mutateAsync({ id: 'dish-1', input: { name: 'Paella valenciana' } })
      })

      expect(spy).toHaveBeenCalledWith('dish-1', { name: 'Paella valenciana' })
    })
  })

  describe('remove', () => {
    it('llama a la API con el id correcto', async () => {
      vi.spyOn(dishesApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(dishesApi, 'remove').mockResolvedValueOnce({ data: undefined, error: null })

      const { result } = renderHook(() => useDishes(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.remove.mutateAsync('dish-1')
      })

      expect(spy).toHaveBeenCalledWith('dish-1')
    })
  })
})
