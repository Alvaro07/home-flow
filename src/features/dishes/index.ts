export { dishesApi } from './api/dishesApi'
export { dishTagsApi } from './api/dishTagsApi'
export type { Dish, DishWithTags, CreateDishInput, UpdateDishInput, DishResult, DishError } from './api/dishes.types'

export { useDishes, dishesQueryKey } from './model/useDishes'
export { useDishTags, dishTagsQueryKey } from './model/useDishTags'
export { DishDialog } from './ui/DishDialog'
