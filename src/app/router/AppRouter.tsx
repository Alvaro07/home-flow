import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import { LoginPage } from '@pages/LoginPage'
import { RegisterPage } from '@pages/RegisterPage'
import { DashboardPage } from '@pages/DashboardPage'
import { ShoppingPage } from '@pages/ShoppingPage'
import { MenuPage } from '@pages/MenuPage'
import { DishesPage } from '@pages/DishesPage'
import { NotFoundPage } from '@pages/NotFoundPage'
import { ProtectedRoute } from '@widgets/ProtectedRoute'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* Rutas públicas — accesibles sin sesión */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Ruta protegida — redirige al login si no hay sesión */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SHOPPING}
          element={
            <ProtectedRoute>
              <ShoppingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.MENU}
          element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.DISHES}
          element={
            <ProtectedRoute>
              <DishesPage />
            </ProtectedRoute>
          }
        />

        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
