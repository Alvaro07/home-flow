import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { supabase } from '@shared/lib/supabase'
import { dishTagsApi } from './dishTagsApi'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const BASE_URL = `${SUPABASE_URL}/rest/v1/dish_tags`

describe('dishTagsApi', () => {
  describe('getAll', () => {
    it('devuelve la lista de tags únicos sin error', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json([{ tag: 'arroz' }, { tag: 'marisco' }, { tag: 'arroz' }]),
        ),
      )

      const result = await dishTagsApi.getAll()

      expect(result.error).toBeNull()
      // Deduplica los tags
      expect(result.data).toEqual(['arroz', 'marisco'])
    })

    it('devuelve lista vacía si no hay tags', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([])),
      )

      const result = await dishTagsApi.getAll()

      expect(result.error).toBeNull()
      expect(result.data).toEqual([])
    })

    it('devuelve error cuando falla la petición', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json({ message: 'DB error', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await dishTagsApi.getAll()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })

  describe('add', () => {
    beforeEach(() => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } as never },
        error: null,
      })
    })

    it('añade el tag sin error', async () => {
      server.use(
        http.post(BASE_URL, () => new HttpResponse(null, { status: 201 })),
      )

      const result = await dishTagsApi.add('dish-1', 'arroz')

      expect(result.error).toBeNull()
    })

    it('devuelve error cuando no hay sesión', async () => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await dishTagsApi.add('dish-1', 'arroz')

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No autenticado')
    })

    it('mapea el error 23505 a mensaje legible', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'duplicate key', code: '23505' }, { status: 409 }),
        ),
      )

      const result = await dishTagsApi.add('dish-1', 'arroz')

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Este tag ya está asociado al plato')
    })

    it('mapea el error 23503 a mensaje legible', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'foreign key violation', code: '23503' }, { status: 409 }),
        ),
      )

      const result = await dishTagsApi.add('no-existe', 'arroz')

      expect(result.error?.message).toBe('El plato referenciado no existe')
    })
  })

  describe('remove', () => {
    it('elimina el tag sin error', async () => {
      server.use(
        http.delete(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await dishTagsApi.remove('dish-1', 'arroz')

      expect(result.error).toBeNull()
    })

    it('devuelve error cuando falla el borrado', async () => {
      server.use(
        http.delete(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await dishTagsApi.remove('dish-1', 'arroz')

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })
})
