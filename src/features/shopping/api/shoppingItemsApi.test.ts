import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { supabase } from '@shared/lib/supabase'
import { shoppingItemsApi } from './shoppingItemsApi'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const BASE_URL = `${SUPABASE_URL}/rest/v1/shopping_items`

const mockItem = {
  id: 'item-1',
  user_id: 'user-1',
  supermarket_id: 'sm-1',
  name: 'Leche',
  quantity: '2L',
  is_checked: false,
  position: 0,
  created_at: '2024-01-01T00:00:00Z',
}

describe('shoppingItemsApi', () => {
  describe('getBySupermarket', () => {
    it('devuelve los items del supermercado sin error', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([mockItem])),
      )

      const result = await shoppingItemsApi.getBySupermarket('sm-1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockItem])
    })

    it('devuelve error cuando falla la petición', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await shoppingItemsApi.getBySupermarket('sm-1')

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })

  describe('create', () => {
    beforeEach(() => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } as never },
        error: null,
      })
    })

    it('devuelve el item creado sin error', async () => {
      server.use(
        http.post(BASE_URL, () => HttpResponse.json(mockItem)),
      )

      const result = await shoppingItemsApi.create({
        supermarket_id: 'sm-1',
        name: 'Leche',
        quantity: '2L',
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockItem)
    })

    it('mapea el error 23503 a mensaje legible', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'foreign key violation', code: '23503' }, { status: 409 }),
        ),
      )

      const result = await shoppingItemsApi.create({
        supermarket_id: 'sm-inexistente',
        name: 'Leche',
      })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('El supermercado seleccionado no existe')
    })

    it('devuelve mensaje genérico para errores no mapeados', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'unknown', code: '99999' }, { status: 500 }),
        ),
      )

      const result = await shoppingItemsApi.create({ supermarket_id: 'sm-1', name: 'Leche' })

      expect(result.error?.message).toBe('Ha ocurrido un error. Inténtalo de nuevo')
    })
  })

  describe('update', () => {
    it('devuelve el item actualizado sin error', async () => {
      const updated = { ...mockItem, name: 'Leche entera' }
      server.use(
        http.patch(BASE_URL, () => HttpResponse.json(updated)),
      )

      const result = await shoppingItemsApi.update('item-1', { name: 'Leche entera' })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updated)
    })

    it('devuelve error cuando falla la actualización', async () => {
      server.use(
        http.patch(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await shoppingItemsApi.update('item-1', { name: 'Leche entera' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })

  describe('removeMany', () => {
    it('devuelve data sin error al borrar varios items', async () => {
      server.use(
        http.delete(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await shoppingItemsApi.removeMany(['item-1', 'item-2', 'item-3'])

      expect(result.error).toBeNull()
    })

    it('devuelve data sin error al borrar un único item', async () => {
      server.use(
        http.delete(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await shoppingItemsApi.removeMany(['item-1'])

      expect(result.error).toBeNull()
    })

    it('devuelve error cuando falla el borrado', async () => {
      server.use(
        http.delete(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await shoppingItemsApi.removeMany(['item-1'])

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })

  describe('reorder', () => {
    it('devuelve data sin error cuando todos los updates tienen éxito', async () => {
      server.use(
        http.patch(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await shoppingItemsApi.reorder([
        { id: 'item-1', position: 0 },
        { id: 'item-2', position: 1 },
      ])

      expect(result.error).toBeNull()
    })

    it('devuelve error si alguno de los updates falla', async () => {
      let calls = 0
      server.use(
        http.patch(BASE_URL, () => {
          calls++
          if (calls === 2) {
            return HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 })
          }
          return new HttpResponse(null, { status: 204 })
        }),
      )

      const result = await shoppingItemsApi.reorder([
        { id: 'item-1', position: 0 },
        { id: 'item-2', position: 1 },
      ])

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })
})
