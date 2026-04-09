import { supabase } from '@shared/lib/supabase'
import type { DishResult, DishError, Dish, DishWithTags, CreateDishInput, UpdateDishInput } from './dishes.types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const mapError = (error: { message: string; code?: string }): DishError => {
  const errorMap: Record<string, string> = {
    '23505': 'Ya existe un plato con ese nombre',
    '23503': 'El plato referenciado no existe',
    '42501': 'No tienes permisos para realizar esta acción',
  }

  return {
    message: errorMap[error.code ?? ''] ?? 'Ha ocurrido un error. Inténtalo de nuevo',
  }
}

type DishRow = Dish & { dish_tags: { tag: string }[] }

const mapDishRow = (row: DishRow): DishWithTags => ({
  id: row.id,
  name: row.name,
  notes: row.notes,
  created_at: row.created_at,
  tags: row.dish_tags.map((t) => t.tag),
})

// ─── API ────────────────────────────────────────────────────────────────────

export const dishesApi = {
  // Obtiene todos los platos del usuario con sus tags, ordenados por nombre
  getAll: async (): Promise<DishResult<DishWithTags[]>> => {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, notes, created_at, dish_tags(tag)')
      .order('name', { ascending: true })

    if (error) return { data: null, error: mapError(error) }
    return { data: (data as unknown as DishRow[]).map(mapDishRow), error: null }
  },

  // Obtiene un plato por id con sus tags
  getById: async (id: string): Promise<DishResult<DishWithTags>> => {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, notes, created_at, dish_tags(tag)')
      .eq('id', id)
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data: mapDishRow(data as unknown as DishRow), error: null }
  },

  // Busca platos por nombre (case-insensitive, búsqueda parcial)
  search: async (query: string): Promise<DishResult<DishWithTags[]>> => {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, notes, created_at, dish_tags(tag)')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })

    if (error) return { data: null, error: mapError(error) }
    return { data: (data as unknown as DishRow[]).map(mapDishRow), error: null }
  },

  // Crea un plato e inserta sus tags en dish_tags
  create: async (input: CreateDishInput): Promise<DishResult<DishWithTags>> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { data: null, error: { message: 'No autenticado' } }

    const { data: dish, error: dishError } = await supabase
      .from('dishes')
      .insert({ name: input.name, notes: input.notes ?? null, user_id: session.user.id })
      .select('id, name, notes, created_at')
      .single()

    if (dishError) return { data: null, error: mapError(dishError) }

    const tags = input.tags ?? []

    if (tags.length > 0) {
      const { error: tagsError } = await supabase
        .from('dish_tags')
        .insert(tags.map((tag) => ({ dish_id: dish.id, tag, user_id: session.user.id })))

      if (tagsError) return { data: null, error: mapError(tagsError) }
    }

    return { data: { ...dish, tags }, error: null }
  },

  // Actualiza nombre y/o notas de un plato
  update: async (id: string, input: UpdateDishInput): Promise<DishResult<Dish>> => {
    const { data, error } = await supabase
      .from('dishes')
      .update(input)
      .eq('id', id)
      .select('id, name, notes, created_at')
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  // Elimina un plato — los dish_tags se borran en cascada por FK
  remove: async (id: string): Promise<DishResult<void>> => {
    const { error } = await supabase.from('dishes').delete().eq('id', id)

    if (error) return { data: null, error: mapError(error) }
    return { data: undefined, error: null }
  },
}
