import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { supabase } from '@shared/lib/supabase'
import { dishesApi } from './dishesApi'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const BASE_URL = `${SUPABASE_URL}/rest/v1/dishes`

const mockDishRow = {
  id: 'dish-1',
  user_id: 'user-1',
  name: 'Paella',
  notes: 'Con marisco',
  created_at: '2024-01-01T00:00:00Z',
  dish_tags: [{ tag: 'arroz' }, { tag: 'marisco' }],
}

const mockDishWithTags = {
  id: 'dish-1',
  name: 'Paella',
  notes: 'Con marisco',
  created_at: '2024-01-01T00:00:00Z',
  tags: ['arroz', 'marisco'],
}

describe('dishesApi', () => {
  describe('getAll', () => {
    it('devuelve los platos con tags sin error', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([mockDishRow])),
      )

      const result = await dishesApi.getAll()

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockDishWithTags])
    })

    it('devuelve error cuando falla la petición', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json({ message: 'DB error', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await dishesApi.getAll()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })

  describe('getById', () => {
    it('devuelve el plato con tags sin error', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json(mockDishRow)),
      )

      const result = await dishesApi.getById('dish-1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockDishWithTags)
    })

    it('devuelve error cuando el plato no existe', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json({ message: 'not found', code: 'PGRST116' }, { status: 406 }),
        ),
      )

      const result = await dishesApi.getById('no-existe')

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })

  describe('search', () => {
    it('devuelve los platos que coinciden con la búsqueda', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([mockDishRow])),
      )

      const result = await dishesApi.search('pae')

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockDishWithTags])
    })

    it('devuelve lista vacía si no hay coincidencias', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([])),
      )

      const result = await dishesApi.search('zzz')

      expect(result.error).toBeNull()
      expect(result.data).toEqual([])
    })
  })

  describe('create', () => {
    beforeEach(() => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } as never },
        error: null,
      })
    })

    it('crea el plato y devuelve datos con tags sin error', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ id: 'dish-1', name: 'Paella', notes: 'Con marisco', created_at: '2024-01-01T00:00:00Z' }),
        ),
        http.post(`${SUPABASE_URL}/rest/v1/dish_tags`, () => new HttpResponse(null, { status: 201 })),
      )

      const result = await dishesApi.create({ name: 'Paella', notes: 'Con marisco', tags: ['arroz', 'marisco'] })

      expect(result.error).toBeNull()
      expect(result.data?.name).toBe('Paella')
      expect(result.data?.tags).toEqual(['arroz', 'marisco'])
    })

    it('crea el plato sin tags', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ id: 'dish-1', name: 'Paella', notes: null, created_at: '2024-01-01T00:00:00Z' }),
        ),
      )

      const result = await dishesApi.create({ name: 'Paella' })

      expect(result.error).toBeNull()
      expect(result.data?.tags).toEqual([])
    })

    it('devuelve error cuando no hay sesión', async () => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await dishesApi.create({ name: 'Paella' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No autenticado')
    })

    it('mapea el error 23505 a mensaje legible', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'duplicate key', code: '23505' }, { status: 409 }),
        ),
      )

      const result = await dishesApi.create({ name: 'Paella' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Ya existe un plato con ese nombre')
    })

    it('devuelve mensaje genérico para errores no mapeados', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'unknown', code: '99999' }, { status: 500 }),
        ),
      )

      const result = await dishesApi.create({ name: 'Paella' })

      expect(result.error?.message).toBe('Ha ocurrido un error. Inténtalo de nuevo')
    })
  })

  describe('update', () => {
    it('devuelve el plato actualizado sin error', async () => {
      const updated = { id: 'dish-1', name: 'Paella valenciana', notes: null, created_at: '2024-01-01T00:00:00Z' }
      server.use(
        http.patch(BASE_URL, () => HttpResponse.json(updated)),
      )

      const result = await dishesApi.update('dish-1', { name: 'Paella valenciana' })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updated)
    })

    it('devuelve error cuando falla la actualización', async () => {
      server.use(
        http.patch(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await dishesApi.update('dish-1', { name: 'Paella valenciana' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })

  describe('remove', () => {
    it('devuelve data sin error al borrar correctamente', async () => {
      server.use(
        http.delete(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await dishesApi.remove('dish-1')

      expect(result.error).toBeNull()
    })

    it('devuelve error cuando falla el borrado', async () => {
      server.use(
        http.delete(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await dishesApi.remove('dish-1')

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })
})
