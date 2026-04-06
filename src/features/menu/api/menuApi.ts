import { supabase } from '@shared/lib/supabase'
import type { Tables } from '@shared/lib/supabase'
import type { MenuResult, MenuError, MealType, DayOfWeek } from './menu.types'

type WeeklyMenuRow = Tables<'weekly_menus'>

export interface WeeklyMenuSlot extends Omit<WeeklyMenuRow, 'day_of_week' | 'meal_type'> {
  day_of_week: DayOfWeek
  meal_type: MealType
  dish: { id: string; name: string } | null
}

export interface UpsertMealInput {
  day_of_week: DayOfWeek
  meal_type: MealType
  description?: string | null
  dish_id?: string | null
}

export const menuApi = {
  getWeekly: async (): Promise<MenuResult<WeeklyMenuSlot[]>> => {
    const { data, error } = await supabase
      .from('weekly_menus')
      .select('*, dish:dishes(id, name)')
      .order('day_of_week', { ascending: true })

    if (error) return { data: null, error: mapError(error) }
    return { data: data as WeeklyMenuSlot[], error: null }
  },

  upsertMeal: async (input: UpsertMealInput): Promise<MenuResult<WeeklyMenuSlot>> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { data: null, error: { message: 'No autenticado' } }

    const { data, error } = await supabase
      .from('weekly_menus')
      .upsert(
        { ...input, user_id: session.user.id },
        { onConflict: 'user_id,day_of_week,meal_type' },
      )
      .select('*, dish:dishes(id, name)')
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data: data as WeeklyMenuSlot, error: null }
  },

  clearMeal: async (id: string): Promise<MenuResult<void>> => {
    const { error } = await supabase
      .from('weekly_menus')
      .delete()
      .eq('id', id)

    if (error) return { data: null, error: mapError(error) }
    return { data: undefined, error: null }
  },
}

const mapError = (error: { message: string; code?: string }): MenuError => {
  const errorMap: Record<string, string> = {
    '42501': 'No tienes permisos para realizar esta acción',
    '23503': 'El plato seleccionado no existe',
  }

  return {
    message: errorMap[error.code ?? ''] ?? 'Ha ocurrido un error. Inténtalo de nuevo',
  }
}
