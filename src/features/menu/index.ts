export { menuApi } from './api/menuApi'
export type { WeeklyMenuSlot, UpsertMealInput } from './api/menuApi'

export { MenuApiError } from './api/menu.types'
export type { MenuResult, MenuError, MealType, DayOfWeek } from './api/menu.types'

export { useWeeklyMenu, weeklyMenuQueryKey } from './model/useWeeklyMenu'

export { WeeklyMenuGrid } from './ui/WeeklyMenuGrid'
export { MealDialog } from './ui/MealDialog'
