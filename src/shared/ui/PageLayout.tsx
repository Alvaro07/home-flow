import type { ReactNode } from 'react'
import { useTheme } from '@shared/lib/theme'
import { SunIcon, MoonIcon } from '@shared/ui/icons'
import './PageLayout.css'

interface PageLayoutProps {
  children: ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-accent" />
      </div>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <main className="page-center">{children}</main>
    </>
  )
}
