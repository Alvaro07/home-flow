import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'

export const dishesQueryKey = ['dishes'] as const

export const useDishes = () => {
  const query = useQuery({
    queryKey: dishesQueryKey,
    queryFn: async () => {
      const result = await dishesApi.getAll()
      if (result.error) throw new Error(result.error.message)
      return result.data ?? []
    },
  })

  return {
    dishes: query.data ?? [],
    isLoading: query.isLoading,
  }
}
