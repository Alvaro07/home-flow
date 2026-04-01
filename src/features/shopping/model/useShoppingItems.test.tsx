import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { shoppingItemsApi } from '../api/shoppingItemsApi'
import { useShoppingItems } from './useShoppingItems'

const SUPERMARKET_ID = 'sm-1'

const mockItem = {
  id: 'item-1',
  user_id: 'user-1',
  supermarket_id: SUPERMARKET_ID,
  name: 'Leche',
  quantity: '2L',
  is_checked: false,
  position: 0,
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

describe('useShoppingItems', () => {
  describe('query', () => {
    it('devuelve los items cuando la API tiene éxito', async () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValueOnce({
        data: [mockItem],
        error: null,
      })

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.items).toEqual([mockItem])
      expect(result.current.error).toBeNull()
    })

    it('devuelve lista vacía mientras carga', () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValueOnce({
        data: [mockItem],
        error: null,
      })

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      expect(result.current.items).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('expone el error cuando la API falla', async () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValueOnce({
        data: null,
        error: { message: 'Error de conexión' },
      })

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.error).not.toBeNull()
    })
  })

  describe('create', () => {
    it('llama a la API con los datos correctos', async () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(shoppingItemsApi, 'create').mockResolvedValueOnce({
        data: mockItem,
        error: null,
      })

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.create.mutateAsync({
          supermarket_id: SUPERMARKET_ID,
          name: 'Leche',
          quantity: '2L',
        })
      })

      expect(spy).toHaveBeenCalledWith({
        supermarket_id: SUPERMARKET_ID,
        name: 'Leche',
        quantity: '2L',
      })
    })

    it('expone error cuando la mutación falla', async () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValue({ data: [], error: null })
      vi.spyOn(shoppingItemsApi, 'create').mockResolvedValueOnce({
        data: null,
        error: { message: 'El supermercado seleccionado no existe' },
      })

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.create
          .mutateAsync({ supermarket_id: SUPERMARKET_ID, name: 'Leche' })
          .catch(() => {})
      })

      await waitFor(() => expect(result.current.create.isError).toBe(true))
    })
  })

  describe('removeMany', () => {
    it('llama a la API con los ids seleccionados', async () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(shoppingItemsApi, 'removeMany').mockResolvedValueOnce({
        data: undefined,
        error: null,
      })

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.removeMany.mutateAsync(['item-1', 'item-2'])
      })

      expect(spy).toHaveBeenCalledWith(['item-1', 'item-2'])
    })
  })

  describe('reorder', () => {
    it('llama a la API con el payload correcto', async () => {
      vi.spyOn(shoppingItemsApi, 'getBySupermarket').mockResolvedValue({ data: [], error: null })
      const spy = vi.spyOn(shoppingItemsApi, 'reorder').mockResolvedValueOnce({
        data: undefined,
        error: null,
      })

      const payload = [
        { id: 'item-1', position: 0 },
        { id: 'item-2', position: 1 },
      ]

      const { result } = renderHook(() => useShoppingItems(SUPERMARKET_ID), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.reorder.mutateAsync(payload)
      })

      expect(spy).toHaveBeenCalledWith(payload)
    })
  })
})
