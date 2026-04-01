import { useAuthStore, selectUser, useAuth } from '@features/auth'
import { useTheme } from '@shared/lib/theme'
import { SunIcon, MoonIcon, LogoutIcon } from '@shared/ui/icons'
import { LogoMark } from '@shared/ui/logo/LogoMark'
import './AppHeader.css'

const getInitials = (email: string): string => {
  const parts = email.split('@')[0]?.split(/[._-]/) ?? []
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase()
}

export const AppHeader = () => {
  const user = useAuthStore(selectUser)
  const { logout, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const initials = user?.email ? getInitials(user.email) : '?'

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <LogoMark size={30} className="app-header__logo-mark" />
        <span className="app-header__brand-name">HomeFlow</span>
      </div>

      <div className="app-header__actions">
        {/* User info */}
        <div className="app-header__user">
          <div className="app-header__avatar" aria-hidden="true">
            <span className="app-header__initials">{initials}</span>
          </div>
          <span className="app-header__email">{user?.email ?? '—'}</span>
        </div>

        {/* Logout */}
        <button
          type="button"
          className="app-header__btn"
          onClick={() => { void logout() }}
          disabled={isLoading}
          aria-label="Cerrar sesión"
        >
          <LogoutIcon width={15} height={15} />
          <span className="app-header__btn-label">Cerrar sesión</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          className="app-header__btn app-header__btn--icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}
