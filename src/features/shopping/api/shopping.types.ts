// Tipos compartidos entre supermarketsApi y shoppingItemsApi

export interface ShoppingError {
  message: string
  status?: number
}

// Error lanzable — extiende Error para cumplir con @typescript-eslint/only-throw-error
// y preserva el status HTTP para que el consumidor pueda inspeccionarlo si lo necesita
export class ShoppingApiError extends Error {
  status?: number

  constructor({ message, status }: ShoppingError) {
    super(message)
    this.name = 'ShoppingApiError'
    this.status = status
  }
}

// Discriminated union — obliga al consumidor a manejar el error explícitamente
export type ShoppingResult<T> =
  | { data: T; error: null }
  | { data: null; error: ShoppingError }

// Payload genérico para reordenar cualquiera de las dos entidades
export type ReorderPayload = Array<{ id: string; position: number }>
