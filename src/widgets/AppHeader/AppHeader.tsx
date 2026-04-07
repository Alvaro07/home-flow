import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, selectUser, useAuth } from '@features/auth'
import { useTheme } from '@shared/lib/theme'
import { SunIcon, MoonIcon, LogoutIcon, CartIcon, CalendarIcon } from '@shared/ui/icons'
import { LogoMark } from '@shared/ui/logo/LogoMark'
import { ROUTES } from '@app/router/routes'
import './AppHeader.css'

const getInitials = (email: string): string => {
  const parts = email.split('@')[0]?.split(/[._-]/) ?? []
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase()
}

interface NavEntry {
  label: string
  route: string
  icon: React.ReactNode
}

const NAV_ENTRIES: NavEntry[] = [
  {
    label: 'Inicio',
    route: ROUTES.DASHBOARD,
    icon: <i className="pi pi-home" aria-hidden="true" />,
  },
  {
    label: 'Lista de la compra',
    route: ROUTES.SHOPPING,
    icon: <CartIcon width={17} height={17} />,
  },
  {
    label: 'Menú semanal',
    route: ROUTES.MENU,
    icon: <CalendarIcon width={17} height={17} />,
  },
]

export const AppHeader = () => {
  const user = useAuthStore(selectUser)
  const { logout, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isNavOpen, setIsNavOpen] = useState(false)

  const initials = user?.email ? getInitials(user.email) : '?'

  const openNav = () => { setIsNavOpen(true) }
  const closeNav = () => { setIsNavOpen(false) }

  // Close on route change
  useEffect(() => { setIsNavOpen(false) }, [location.pathname])

  // Close on Escape
  useEffect(() => {
    if (!isNavOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNav() }
    document.addEventListener('keydown', handler)
    return () => { document.removeEventListener('keydown', handler) }
  }, [isNavOpen])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isNavOpen])

  const handleNavClick = (route: string) => {
    void navigate(route)
  }

  return (
    <>
      <header className="app-header">
        <button
          type="button"
          className="app-header__brand"
          onClick={() => { void navigate(ROUTES.DASHBOARD) }}
          aria-label="Ir al inicio"
        >
          <LogoMark size={30} className="app-header__logo-mark" />
          <span className="app-header__brand-name">HomeFlow</span>
        </button>

        <div className="app-header__actions">
          {/* Theme toggle */}
          <button
            type="button"
            className="app-header__btn app-header__btn--icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Hamburger */}
          <button
            type="button"
            className={`hamburger-btn${isNavOpen ? ' hamburger-btn--open' : ''}`}
            onClick={isNavOpen ? closeNav : openNav}
            aria-label={isNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isNavOpen}
          >
            <span className="hamburger-btn__bar" />
            <span className="hamburger-btn__bar" />
            <span className="hamburger-btn__bar" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`nav-drawer-backdrop${isNavOpen ? ' nav-drawer-backdrop--open' : ''}`}
        onClick={closeNav}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`nav-drawer${isNavOpen ? ' nav-drawer--open' : ''}`}
        aria-label="Navegación principal"
      >
        {/* Drawer header */}
        <div className="nav-drawer__header">
          <div className="nav-drawer__brand">
            <LogoMark size={28} className="nav-drawer__logo" />
            <span className="nav-drawer__brand-name">HomeFlow</span>
          </div>
          <button
            type="button"
            className="nav-drawer__close"
            onClick={closeNav}
            aria-label="Cerrar menú"
          >
            <i className="pi pi-times" aria-hidden="true" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="nav-drawer__nav" aria-label="Secciones">
          <ul role="list" className="nav-drawer__list">
            {NAV_ENTRIES.map((entry) => {
              const isActive = location.pathname === entry.route
              return (
                <li key={entry.route}>
                  <button
                    type="button"
                    className={`nav-drawer__item${isActive ? ' nav-drawer__item--active' : ''}`}
                    onClick={() => { handleNavClick(entry.route) }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-drawer__item-icon">{entry.icon}</span>
                    <span className="nav-drawer__item-label">{entry.label}</span>
                    {isActive && <span className="nav-drawer__item-dot" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer: user + logout */}
        <div className="nav-drawer__footer">
          <div className="nav-drawer__user">
            <div className="nav-drawer__avatar" aria-hidden="true">
              <span className="nav-drawer__initials">{initials}</span>
            </div>
            <span className="nav-drawer__email">{user?.email ?? '—'}</span>
          </div>
          <button
            type="button"
            className="nav-drawer__logout"
            onClick={() => { void logout() }}
            disabled={isLoading}
            aria-label="Cerrar sesión"
          >
            <LogoutIcon width={14} height={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
