export interface DishError {
  message: string
}

export class DishApiError extends Error {
  constructor({ message }: DishError) {
    super(message)
    this.name = 'DishApiError'
  }
}

export type DishResult<T> = { data: T; error: null } | { data: null; error: DishError }

export interface Dish {
  id: string
  name: string
  notes: string | null
  created_at: string | null
}

export interface DishWithTags extends Dish {
  tags: string[]
}

export interface CreateDishInput {
  name: string
  notes?: string | null
  tags?: string[]
}

export interface UpdateDishInput {
  name?: string
  notes?: string | null
}

export interface DishesPage {
  dishes: DishWithTags[]
  total: number
}
