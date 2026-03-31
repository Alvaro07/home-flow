import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectUser, useAuth } from '@features/auth'
import { PageLayout } from '@shared/ui/PageLayout'
import { CartIcon, LogoutIcon } from '@shared/ui/icons'
import { ROUTES } from '@app/router/routes'
import './DashboardPage.css'

const getInitials = (email: string): string => {
  const parts = email.split('@')[0]?.split(/[._-]/) ?? []
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase()
}

export const DashboardPage = () => {
  const user = useAuthStore(selectUser)
  const { logout, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const initials = user?.email ? getInitials(user.email) : '?'

  return (
    <PageLayout>
      <div className="glass-card dashboard-card anim-card">
        {/* Avatar */}
        <div className="avatar-ring anim-1" aria-hidden="true">
          <span className="avatar-initials">{initials}</span>
        </div>

        {/* Status badge */}
        <div className="dashboard-status-wrap anim-2">
          <span className="dashboard-status">Sesión activa</span>
        </div>

        {/* Title */}
        <h1 className="card-title anim-2">Dashboard</h1>
        <p className="card-subtitle dashboard-subtitle anim-3">Conectado como</p>

        {/* Email pill */}
        <div className="dashboard-email anim-3">{user?.email ?? '—'}</div>

        {/* Navigation */}
        <button
          className="btn-secondary btn-full anim-4"
          onClick={() => {
            void navigate(ROUTES.SHOPPING)
          }}
        >
          <CartIcon className="btn-icon" />
          Lista de la compra
        </button>

        {/* Logout */}
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <button
          id="logout-btn"
          className="btn-secondary btn-full anim-4"
          onClick={() => {
            void logout()
          }}
          disabled={isLoading}
        >
          <LogoutIcon className="btn-icon" />
          Cerrar sesión
        </button>
      </div>
    </PageLayout>
  )
}
