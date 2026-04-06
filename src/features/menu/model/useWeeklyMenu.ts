import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '../api/menuApi'
import type { UpsertMealInput } from '../api/menuApi'
import { MenuApiError } from '../api/menu.types'
import type { DayOfWeek } from '../api/menu.types'

export const weeklyMenuQueryKey = ['weekly-menu'] as const

export const useWeeklyMenu = () => {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: weeklyMenuQueryKey })

  const query = useQuery({
    queryKey: weeklyMenuQueryKey,
    queryFn: async () => {
      const result = await menuApi.getWeekly()
      if (result.error) throw new MenuApiError(result.error)
      return result.data
    },
  })

  const upsert = useMutation({
    mutationFn: async (input: UpsertMealInput) => {
      const result = await menuApi.upsertMeal(input)
      if (result.error) throw new MenuApiError(result.error)
      return result.data
    },
    onSuccess: invalidate,
  })

  const clear = useMutation({
    mutationFn: async (id: string) => {
      const result = await menuApi.clearMeal(id)
      if (result.error) throw new MenuApiError(result.error)
    },
    onSuccess: invalidate,
  })

  const clearDay = useMutation({
    mutationFn: async (dayOfWeek: DayOfWeek) => {
      const result = await menuApi.clearDay(dayOfWeek)
      if (result.error) throw new MenuApiError(result.error)
    },
    onSuccess: invalidate,
  })

  const clearWeek = useMutation({
    mutationFn: async () => {
      const result = await menuApi.clearWeek()
      if (result.error) throw new MenuApiError(result.error)
    },
    onSuccess: invalidate,
  })

  return {
    slots: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    upsert,
    clear,
    clearDay,
    clearWeek,
  }
}
