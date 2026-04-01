import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { supabase } from '@shared/lib/supabase'
import { supermarketsApi } from './supermarketsApi'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const BASE_URL = `${SUPABASE_URL}/rest/v1/supermarkets`

const mockSupermarket = {
  id: 'sm-1',
  user_id: 'user-1',
  name: 'Mercadona',
  color: '#00a650',
  position: 0,
  is_default: false,
  created_at: '2024-01-01T00:00:00Z',
}

describe('supermarketsApi', () => {
  describe('getAll', () => {
    it('devuelve la lista de supermercados sin error', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([mockSupermarket])),
      )

      const result = await supermarketsApi.getAll()

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockSupermarket])
    })

    it('devuelve error cuando falla la petición', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json({ message: 'DB error', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await supermarketsApi.getAll()

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

    it('devuelve el supermercado creado sin error', async () => {
      server.use(
        http.post(BASE_URL, () => HttpResponse.json(mockSupermarket)),
      )

      const result = await supermarketsApi.create({ name: 'Mercadona' })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSupermarket)
    })

    it('mapea el error 23505 a mensaje legible', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'duplicate key', code: '23505' }, { status: 409 }),
        ),
      )

      const result = await supermarketsApi.create({ name: 'Mercadona' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Ya existe un supermercado con ese nombre')
    })

    it('devuelve mensaje genérico para errores no mapeados', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'unknown error', code: '99999' }, { status: 500 }),
        ),
      )

      const result = await supermarketsApi.create({ name: 'Mercadona' })

      expect(result.error?.message).toBe('Ha ocurrido un error. Inténtalo de nuevo')
    })
  })

  describe('update', () => {
    it('devuelve el supermercado actualizado sin error', async () => {
      const updated = { ...mockSupermarket, name: 'Carrefour' }
      server.use(
        http.patch(BASE_URL, () => HttpResponse.json(updated)),
      )

      const result = await supermarketsApi.update('sm-1', { name: 'Carrefour' })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updated)
    })

    it('devuelve error cuando falla la actualización', async () => {
      server.use(
        http.patch(BASE_URL, () =>
          HttpResponse.json({ message: 'not found', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await supermarketsApi.update('sm-1', { name: 'Carrefour' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })

  describe('remove', () => {
    it('devuelve data sin error al borrar correctamente', async () => {
      server.use(
        http.delete(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await supermarketsApi.remove('sm-1')

      expect(result.error).toBeNull()
    })

    it('devuelve error cuando falla el borrado', async () => {
      server.use(
        http.delete(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await supermarketsApi.remove('sm-1')

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })

  describe('reorder', () => {
    it('devuelve data sin error cuando todos los updates tienen éxito', async () => {
      server.use(
        http.patch(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await supermarketsApi.reorder([
        { id: 'sm-1', position: 0 },
        { id: 'sm-2', position: 1 },
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

      const result = await supermarketsApi.reorder([
        { id: 'sm-1', position: 0 },
        { id: 'sm-2', position: 1 },
      ])

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
    })
  })
})
