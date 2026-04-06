import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@shared/ui/PageLayout'
import { WeeklyMenuGrid } from '@features/menu'
import { ROUTES } from '@app/router/routes'
import './MenuPage.css'

export const MenuPage = () => {
  const navigate = useNavigate()

  return (
    <PageLayout withHeader>
      <div className="menu-page anim-card">
        <button
          type="button"
          className="menu-page__back anim-1"
          onClick={() => { void navigate(ROUTES.DASHBOARD) }}
        >
          <i className="pi pi-arrow-left" />
          Volver
        </button>

        <div className="anim-2">
          <WeeklyMenuGrid />
        </div>
      </div>
    </PageLayout>
  )
}
