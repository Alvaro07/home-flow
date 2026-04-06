export type MealType = 'breakfast' | 'lunch' | 'dinner'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface MenuError {
  message: string
  status?: number
}

export class MenuApiError extends Error {
  status?: number

  constructor({ message, status }: MenuError) {
    super(message)
    this.name = 'MenuApiError'
    this.status = status
  }
}

export type MenuResult<T> =
  | { data: T; error: null }
  | { data: null; error: MenuError }
