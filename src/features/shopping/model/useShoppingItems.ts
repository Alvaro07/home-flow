import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shoppingItemsApi } from '../api/shoppingItemsApi'
import type { CreateShoppingItemInput, UpdateShoppingItemInput } from '../api/shoppingItemsApi'
import { ShoppingApiError } from '../api/shopping.types'
import type { ReorderPayload } from '../api/shopping.types'

const queryKey = (supermarketId: string) => ['shopping-items', supermarketId] as const

export const useShoppingItems = (supermarketId: string) => {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKey(supermarketId) })

  const query = useQuery({
    queryKey: queryKey(supermarketId),
    queryFn: async () => {
      const result = await shoppingItemsApi.getBySupermarket(supermarketId)
      if (result.error) throw new ShoppingApiError(result.error)
      return result.data
    },
  })

  const create = useMutation({
    mutationFn: async (input: CreateShoppingItemInput) => {
      const result = await shoppingItemsApi.create(input)
      if (result.error) throw new ShoppingApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateShoppingItemInput }) => {
      const result = await shoppingItemsApi.update(id, input)
      if (result.error) throw new ShoppingApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const removeMany = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await shoppingItemsApi.removeMany(ids)
      if (result.error) throw new ShoppingApiError(result.error)
    },
    onSuccess: invalidate,
  })

  const reorder = useMutation({
    mutationFn: async (payload: ReorderPayload) => {
      const result = await shoppingItemsApi.reorder(payload)
      if (result.error) throw new ShoppingApiError(result.error)
    },
    onSuccess: invalidate,
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    removeMany,
    reorder,
  }
}
