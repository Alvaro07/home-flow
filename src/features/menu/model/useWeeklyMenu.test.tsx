import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { menuApi } from '../api/menuApi'
import { useWeeklyMenu } from './useWeeklyMenu'

const mockSlot = {
  id: 'slot-1',
  user_id: 'user-1',
  day_of_week: 1 as const,
  meal_type: 'lunch' as const,
  description: 'Paella',
  dish_id: null,
  dish: null,
  updated_at: '2024-01-01T00:00:00Z',
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

describe('useWeeklyMenu', () => {
  describe('query', () => {
    it('devuelve los slots cuando la API tiene éxito', async () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValueOnce({
        data: [mockSlot],
        error: null,
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.slots).toEqual([mockSlot])
      expect(result.current.error).toBeNull()
    })

    it('devuelve lista vacía mientras carga', () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValueOnce({
        data: [mockSlot],
        error: null,
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      expect(result.current.slots).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('expone el error cuando la API falla', async () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error de conexión' },
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => { expect(result.current.isLoading).toBe(false) })

      expect(result.current.error).not.toBeNull()
    })
  })

  describe('upsert', () => {
    it('llama a la API con los datos correctos (texto libre)', async () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(menuApi, 'upsertMeal').mockResolvedValueOnce({
        data: mockSlot,
        error: null,
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.upsert.mutateAsync({
          day_of_week: 1,
          meal_type: 'lunch',
          description: 'Paella',
        })
      })

      expect(spy).toHaveBeenCalledWith({
        day_of_week: 1,
        meal_type: 'lunch',
        description: 'Paella',
      })
    })

    it('llama a la API con dish_id al asignar un plato de recetas', async () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(menuApi, 'upsertMeal').mockResolvedValueOnce({
        data: { ...mockSlot, dish_id: 'dish-1', dish: { id: 'dish-1', name: 'Paella' } },
        error: null,
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.upsert.mutateAsync({
          day_of_week: 1,
          meal_type: 'lunch',
          dish_id: 'dish-1',
        })
      })

      expect(spy).toHaveBeenCalledWith({ day_of_week: 1, meal_type: 'lunch', dish_id: 'dish-1' })
    })

    it('expone error cuando la mutación falla', async () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValue({ data: [], error: null })
      vi.spyOn(menuApi, 'upsertMeal').mockResolvedValueOnce({
        data: null,
        error: { message: 'El plato seleccionado no existe' },
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.upsert
          .mutateAsync({ day_of_week: 0, meal_type: 'breakfast', dish_id: 'inexistente' })
          .catch(() => {})
      })

      await waitFor(() => { expect(result.current.upsert.isError).toBe(true) })
    })
  })

  describe('clear', () => {
    it('llama a la API con el id correcto', async () => {
      vi.spyOn(menuApi, 'getWeekly').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(menuApi, 'clearMeal').mockResolvedValueOnce({
        data: undefined,
        error: null,
      })

      const { result } = renderHook(() => useWeeklyMenu(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.clear.mutateAsync('slot-1')
      })

      expect(spy).toHaveBeenCalledWith('slot-1')
    })
  })
})
