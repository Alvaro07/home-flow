import { supabase } from '@shared/lib/supabase'
import type { Tables } from '@shared/lib/supabase'
import type { ShoppingResult, ReorderPayload, ShoppingError } from './shopping.types'

type Supermarket = Tables<'supermarkets'>

export interface CreateSupermarketInput {
  name: string
  color?: string
  position?: number
}

export interface UpdateSupermarketInput {
  name?: string
  color?: string | null
  is_default?: boolean
}

export const supermarketsApi = {
  // Obtiene todos los supermercados del usuario ordenados por posición
  getAll: async (): Promise<ShoppingResult<Supermarket[]>> => {
    const { data, error } = await supabase
      .from('supermarkets')
      .select('*')
      .order('position', { ascending: true })

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  create: async (input: CreateSupermarketInput): Promise<ShoppingResult<Supermarket>> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { data: null, error: { message: 'No autenticado' } }

    const { data, error } = await supabase
      .from('supermarkets')
      .insert({ ...input, user_id: session.user.id, position: input.position ?? 0 })
      .select()
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  update: async (
    id: string,
    input: UpdateSupermarketInput,
  ): Promise<ShoppingResult<Supermarket>> => {
    const { data, error } = await supabase
      .from('supermarkets')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  remove: async (id: string): Promise<ShoppingResult<void>> => {
    const { error } = await supabase.from('supermarkets').delete().eq('id', id)

    if (error) return { data: null, error: mapError(error) }
    return { data: undefined, error: null }
  },

  // Actualiza las posiciones en paralelo — Supabase no soporta batch update nativo
  reorder: async (payload: ReorderPayload): Promise<ShoppingResult<void>> => {
    const results = await Promise.all(
      payload.map(({ id, position }) =>
        supabase.from('supermarkets').update({ position }).eq('id', id),
      ),
    )

    const failed = results.find(({ error }) => error !== null)
    if (failed?.error) return { data: null, error: mapError(failed.error) }
    return { data: undefined, error: null }
  },
}

const mapError = (error: { message: string; code?: string }): ShoppingError => {
  const errorMap: Record<string, string> = {
    '23505': 'Ya existe un supermercado con ese nombre',
    '42501': 'No tienes permisos para realizar esta acción',
  }

  return {
    message: errorMap[error.code ?? ''] ?? 'Ha ocurrido un error. Inténtalo de nuevo',
  }
}
