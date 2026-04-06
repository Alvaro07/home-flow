import { supabase } from '@shared/lib/supabase'
import type { Tables } from '@shared/lib/supabase'

export type Dish = Pick<Tables<'dishes'>, 'id' | 'name' | 'notes'>

export const dishesApi = {
  getAll: async (): Promise<{ data: Dish[] | null; error: { message: string } | null }> => {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, notes')
      .order('name', { ascending: true })

    if (error) return { data: null, error: { message: 'Error al cargar los platos' } }
    return { data, error: null }
  },
}
