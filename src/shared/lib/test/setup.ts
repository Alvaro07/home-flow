import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './server'

// Arranca el servidor MSW antes de todos los tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Limpia los handlers después de cada test
// para que no se contaminen entre sí
afterEach(() => {
  server.resetHandlers()
})

// Cierra el servidor al terminar todos los tests
afterAll(() => {
  server.close()
})
