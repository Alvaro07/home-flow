import { setupServer } from 'msw/node'

// El servidor de MSW para el entorno de Node (tests)
// Los handlers se añaden en cada test o suite
export const server = setupServer()
