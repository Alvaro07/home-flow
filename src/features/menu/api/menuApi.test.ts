import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { supabase } from '@shared/lib/supabase'
import { menuApi } from './menuApi'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const BASE_URL = `${SUPABASE_URL}/rest/v1/weekly_menus`

const mockSlot = {
  id: 'slot-1',
  user_id: 'user-1',
  day_of_week: 1,
  meal_type: 'lunch',
  description: 'Paella',
  dish_id: null,
  dish: null,
  updated_at: '2024-01-01T00:00:00Z',
}

describe('menuApi', () => {
  describe('getWeekly', () => {
    it('devuelve los slots de la semana sin error', async () => {
      server.use(
        http.get(BASE_URL, () => HttpResponse.json([mockSlot])),
      )

      const result = await menuApi.getWeekly()

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockSlot])
    })

    it('devuelve error cuando falla la petición', async () => {
      server.use(
        http.get(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await menuApi.getWeekly()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })

  describe('upsertMeal', () => {
    beforeEach(() => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } as never },
        error: null,
      })
    })

    it('devuelve el slot creado sin error', async () => {
      server.use(
        http.post(BASE_URL, () => HttpResponse.json(mockSlot)),
      )

      const result = await menuApi.upsertMeal({
        day_of_week: 1,
        meal_type: 'lunch',
        description: 'Paella',
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSlot)
    })

    it('devuelve el slot con plato linkado', async () => {
      const slotWithDish = {
        ...mockSlot,
        dish_id: 'dish-1',
        description: null,
        dish: { id: 'dish-1', name: 'Paella valenciana' },
      }
      server.use(
        http.post(BASE_URL, () => HttpResponse.json(slotWithDish)),
      )

      const result = await menuApi.upsertMeal({
        day_of_week: 1,
        meal_type: 'lunch',
        dish_id: 'dish-1',
      })

      expect(result.error).toBeNull()
      expect(result.data?.dish).toEqual({ id: 'dish-1', name: 'Paella valenciana' })
    })

    it('mapea el error 23503 a mensaje legible', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'foreign key violation', code: '23503' }, { status: 409 }),
        ),
      )

      const result = await menuApi.upsertMeal({
        day_of_week: 0,
        meal_type: 'breakfast',
        dish_id: 'dish-inexistente',
      })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('El plato seleccionado no existe')
    })

    it('devuelve error cuando no hay sesión', async () => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await menuApi.upsertMeal({ day_of_week: 0, meal_type: 'breakfast' })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No autenticado')
    })

    it('devuelve mensaje genérico para errores no mapeados', async () => {
      server.use(
        http.post(BASE_URL, () =>
          HttpResponse.json({ message: 'unknown', code: '99999' }, { status: 500 }),
        ),
      )

      const result = await menuApi.upsertMeal({ day_of_week: 0, meal_type: 'dinner' })

      expect(result.error?.message).toBe('Ha ocurrido un error. Inténtalo de nuevo')
    })
  })

  describe('clearMeal', () => {
    it('devuelve data sin error al borrar el slot', async () => {
      server.use(
        http.delete(BASE_URL, () => new HttpResponse(null, { status: 204 })),
      )

      const result = await menuApi.clearMeal('slot-1')

      expect(result.error).toBeNull()
    })

    it('devuelve error cuando falla el borrado', async () => {
      server.use(
        http.delete(BASE_URL, () =>
          HttpResponse.json({ message: 'forbidden', code: '42501' }, { status: 403 }),
        ),
      )

      const result = await menuApi.clearMeal('slot-1')

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('No tienes permisos para realizar esta acción')
    })
  })
})
