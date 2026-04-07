import type { ReactNode } from 'react'
import { useTheme } from '@shared/lib/theme'
import { SunIcon, MoonIcon } from '@shared/ui/icons'
import './PageLayout.css'

interface PageLayoutProps {
  children: ReactNode
  withHeader?: boolean
}

export const PageLayout = ({ children, withHeader = false }: PageLayoutProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <div className="app-bg" aria-hidden="true" />

      {/* Theme toggle only on public pages (auth pages) */}
      {!withHeader && (
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      )}

      <main className={`page-center${withHeader ? ' page-center--with-header' : ''}`}>
        {children}
      </main>
    </>
  )
}
