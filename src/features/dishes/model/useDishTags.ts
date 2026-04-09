import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dishTagsApi } from '../api/dishTagsApi'
import { DishApiError } from '../api/dishes.types'

export const dishTagsQueryKey = ['dish-tags'] as const

export const useDishTags = () => {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: dishTagsQueryKey })
    // Invalidar platos también ya que los tags van incrustados en DishWithTags
    void queryClient.invalidateQueries({ queryKey: ['dishes'] })
  }

  const query = useQuery({
    queryKey: dishTagsQueryKey,
    queryFn: async () => {
      const result = await dishTagsApi.getAll()
      if (result.error) throw new DishApiError(result.error)
      return result.data
    },
  })

  const add = useMutation({
    mutationFn: async ({ dishId, tag }: { dishId: string; tag: string }) => {
      const result = await dishTagsApi.add(dishId, tag)
      if (result.error) throw new DishApiError(result.error)
    },
    onSuccess: invalidateAll,
  })

  const remove = useMutation({
    mutationFn: async ({ dishId, tag }: { dishId: string; tag: string }) => {
      const result = await dishTagsApi.remove(dishId, tag)
      if (result.error) throw new DishApiError(result.error)
    },
    onSuccess: invalidateAll,
  })

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    add,
    remove,
  }
}
