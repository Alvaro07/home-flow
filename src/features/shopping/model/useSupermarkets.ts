import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supermarketsApi } from '../api/supermarketsApi'
import type { CreateSupermarketInput, UpdateSupermarketInput } from '../api/supermarketsApi'
import { ShoppingApiError } from '../api/shopping.types'
import type { ReorderPayload } from '../api/shopping.types'

export const supermarketsQueryKey = ['supermarkets'] as const

export const useSupermarkets = () => {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: supermarketsQueryKey })

  const query = useQuery({
    queryKey: supermarketsQueryKey,
    queryFn: async () => {
      const result = await supermarketsApi.getAll()
      if (result.error) throw new ShoppingApiError(result.error)
      return result.data
    },
  })

  const create = useMutation({
    mutationFn: async (input: CreateSupermarketInput) => {
      const result = await supermarketsApi.create(input)
      if (result.error) throw new ShoppingApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSupermarketInput }) => {
      const result = await supermarketsApi.update(id, input)
      if (result.error) throw new ShoppingApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const result = await supermarketsApi.remove(id)
      if (result.error) throw new ShoppingApiError(result.error)
    },
    onSuccess: invalidate,
  })

  const reorder = useMutation({
    mutationFn: async (payload: ReorderPayload) => {
      const result = await supermarketsApi.reorder(payload)
      if (result.error) throw new ShoppingApiError(result.error)
    },
    onSuccess: invalidate,
  })

  return {
    supermarkets: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
    reorder,
  }
}
