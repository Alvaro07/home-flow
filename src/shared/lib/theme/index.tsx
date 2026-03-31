import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// Lee localStorage y aplica data-theme al DOM de forma síncrona,
// antes del primer render — evita el flash del tema incorrecto
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('hf-theme')
  const theme: Theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  return theme
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Sincroniza con el DOM y localStorage cada vez que cambia el tema
  // Uso correcto de useEffect: estamos sincronizando con sistemas externos
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hf-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
