import { supabase } from '@shared/lib/supabase'
import type { Tables } from '@shared/lib/supabase'
import type { ShoppingResult, ReorderPayload, ShoppingError } from './shopping.types'

type ShoppingItem = Tables<'shopping_items'>

export interface CreateShoppingItemInput {
  supermarket_id: string
  name: string
  quantity?: string
  position?: number
}

export interface UpdateShoppingItemInput {
  name?: string
  quantity?: string | null
}

export const shoppingItemsApi = {
  // Obtiene todos los items de un supermercado ordenados por posición
  getBySupermarket: async (supermarketId: string): Promise<ShoppingResult<ShoppingItem[]>> => {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('supermarket_id', supermarketId)
      .order('position', { ascending: true })

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  create: async (input: CreateShoppingItemInput): Promise<ShoppingResult<ShoppingItem>> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { data: null, error: { message: 'No autenticado' } }

    const { data, error } = await supabase
      .from('shopping_items')
      .insert({ ...input, user_id: session.user.id, position: input.position ?? 0 })
      .select()
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  update: async (id: string, input: UpdateShoppingItemInput): Promise<ShoppingResult<ShoppingItem>> => {
    const { data, error } = await supabase
      .from('shopping_items')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: mapError(error) }
    return { data, error: null }
  },

  // Elimina uno o varios items — el front pasa los ids seleccionados
  removeMany: async (ids: string[]): Promise<ShoppingResult<void>> => {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .in('id', ids)

    if (error) return { data: null, error: mapError(error) }
    return { data: undefined, error: null }
  },

  // Actualiza las posiciones en paralelo — Supabase no soporta batch update nativo
  reorder: async (payload: ReorderPayload): Promise<ShoppingResult<void>> => {
    const results = await Promise.all(
      payload.map(({ id, position }) =>
        supabase.from('shopping_items').update({ position }).eq('id', id)
      )
    )

    const failed = results.find(({ error }) => error !== null)
    if (failed?.error) return { data: null, error: mapError(failed.error) }
    return { data: undefined, error: null }
  },
}

const mapError = (error: { message: string; code?: string }): ShoppingError => {
  const errorMap: Record<string, string> = {
    '23503': 'El supermercado seleccionado no existe',
    '42501': 'No tienes permisos para realizar esta acción',
  }

  return {
    message: errorMap[error.code ?? ''] ?? 'Ha ocurrido un error. Inténtalo de nuevo',
  }
}
