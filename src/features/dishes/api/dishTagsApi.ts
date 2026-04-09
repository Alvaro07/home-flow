import { supabase } from '@shared/lib/supabase'
import type { DishResult, DishError } from './dishes.types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const mapError = (error: { message: string; code?: string }): DishError => {
  const errorMap: Record<string, string> = {
    '23505': 'Este tag ya está asociado al plato',
    '23503': 'El plato referenciado no existe',
    '42501': 'No tienes permisos para realizar esta acción',
  }

  return {
    message: errorMap[error.code ?? ''] ?? 'Ha ocurrido un error. Inténtalo de nuevo',
  }
}

// ─── API ────────────────────────────────────────────────────────────────────

export const dishTagsApi = {
  // Obtiene todos los tags únicos del usuario (para el selector de tags)
  getAll: async (): Promise<DishResult<string[]>> => {
    const { data, error } = await supabase
      .from('dish_tags')
      .select('tag')
      .order('tag', { ascending: true })

    if (error) return { data: null, error: mapError(error) }

    const unique = [...new Set((data as { tag: string }[]).map((r) => r.tag))]
    return { data: unique, error: null }
  },

  // Añade un tag a un plato
  add: async (dishId: string, tag: string): Promise<DishResult<void>> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { data: null, error: { message: 'No autenticado' } }

    const { error } = await supabase
      .from('dish_tags')
      .insert({ dish_id: dishId, tag, user_id: session.user.id })

    if (error) return { data: null, error: mapError(error) }
    return { data: undefined, error: null }
  },

  // Elimina un tag de un plato
  remove: async (dishId: string, tag: string): Promise<DishResult<void>> => {
    const { error } = await supabase
      .from('dish_tags')
      .delete()
      .eq('dish_id', dishId)
      .eq('tag', tag)

    if (error) return { data: null, error: mapError(error) }
    return { data: undefined, error: null }
  },
}
