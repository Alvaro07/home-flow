import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import type { CreateDishInput, UpdateDishInput } from '../api/dishes.types'
import { DishApiError } from '../api/dishes.types'

export const dishesQueryKey = ['dishes'] as const

export const useDishes = () => {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: dishesQueryKey })

  const query = useQuery({
    queryKey: dishesQueryKey,
    queryFn: async () => {
      const result = await dishesApi.getAll()
      if (result.error) throw new DishApiError(result.error)
      return result.data
    },
  })

  const create = useMutation({
    mutationFn: async (input: CreateDishInput) => {
      const result = await dishesApi.create(input)
      if (result.error) throw new DishApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateDishInput }) => {
      const result = await dishesApi.update(id, input)
      if (result.error) throw new DishApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const result = await dishesApi.remove(id)
      if (result.error) throw new DishApiError(result.error)
    },
    onSuccess: invalidate,
  })

  return {
    dishes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
  }
}
