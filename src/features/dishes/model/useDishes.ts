import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dishesApi, PAGE_SIZE } from '../api/dishesApi'
import type { CreateDishInput, UpdateDishInput } from '../api/dishes.types'
import { DishApiError } from '../api/dishes.types'

export const dishesQueryKey = ['dishes'] as const

interface DishesParams {
  page?: number
  pageSize?: number
  tag?: string | null
}

export const useDishes = ({ page = 0, pageSize = PAGE_SIZE, tag = null }: DishesParams = {}) => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: dishesQueryKey })
    void queryClient.invalidateQueries({ queryKey: ['dish-tags'] })
  }

  const query = useQuery({
    queryKey: [...dishesQueryKey, page, pageSize, tag],
    queryFn: async () => {
      const result = await dishesApi.getAll({ page, pageSize, tag })
      if (result.error) throw new DishApiError(result.error)
      return result.data
    },
    placeholderData: (prev) => prev,
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

  const total = query.data?.total ?? 0
  const pageCount = Math.ceil(total / pageSize)

  return {
    dishes: query.data?.dishes ?? [],
    total,
    pageCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    create,
    update,
    remove,
  }
}
