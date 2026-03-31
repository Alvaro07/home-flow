import type { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => (
  <>
    <div className="app-bg" aria-hidden="true">
      <div className="app-bg-accent" />
    </div>
    <main className="page-center">{children}</main>
  </>
)
