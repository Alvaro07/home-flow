export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SHOPPING: '/shopping',
  NOT_FOUND: '*',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
