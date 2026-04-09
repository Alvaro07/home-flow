import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { dishTagsApi } from '../api/dishTagsApi'
import { useDishTags } from './useDishTags'

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

describe('useDishTags', () => {
  describe('query', () => {
    it('devuelve los tags cuando la API tiene éxito', async () => {
      vi.spyOn(dishTagsApi, 'getAll').mockResolvedValueOnce({ data: ['arroz', 'marisco'], error: null })

      const { result } = renderHook(() => useDishTags(), { wrapper: createWrapper() })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.tags).toEqual(['arroz', 'marisco'])
      expect(result.current.error).toBeNull()
    })

    it('devuelve lista vacía mientras carga', () => {
      vi.spyOn(dishTagsApi, 'getAll').mockResolvedValueOnce({ data: ['arroz'], error: null })

      const { result } = renderHook(() => useDishTags(), { wrapper: createWrapper() })

      expect(result.current.tags).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('expone el error cuando la API falla', async () => {
      vi.spyOn(dishTagsApi, 'getAll').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error de conexión' },
      })

      const { result } = renderHook(() => useDishTags(), { wrapper: createWrapper() })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.error).not.toBeNull()
    })
  })

  describe('add', () => {
    it('llama a la API con dishId y tag correctos', async () => {
      vi.spyOn(dishTagsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(dishTagsApi, 'add').mockResolvedValueOnce({ data: undefined, error: null })

      const { result } = renderHook(() => useDishTags(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.add.mutateAsync({ dishId: 'dish-1', tag: 'arroz' })
      })

      expect(spy).toHaveBeenCalledWith('dish-1', 'arroz')
    })

    it('expone error cuando la mutación falla', async () => {
      vi.spyOn(dishTagsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      vi.spyOn(dishTagsApi, 'add').mockResolvedValueOnce({
        data: null,
        error: { message: 'Este tag ya está asociado al plato' },
      })

      const { result } = renderHook(() => useDishTags(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.add.mutateAsync({ dishId: 'dish-1', tag: 'arroz' }).catch(() => {})
      })

      await waitFor(() => { expect(result.current.add.isError).toBe(true) })
    })
  })

  describe('remove', () => {
    it('llama a la API con dishId y tag correctos', async () => {
      vi.spyOn(dishTagsApi, 'getAll').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(dishTagsApi, 'remove').mockResolvedValueOnce({ data: undefined, error: null })

      const { result } = renderHook(() => useDishTags(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.remove.mutateAsync({ dishId: 'dish-1', tag: 'arroz' })
      })

      expect(spy).toHaveBeenCalledWith('dish-1', 'arroz')
    })
  })
})
