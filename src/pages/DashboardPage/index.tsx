import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@shared/ui/PageLayout'
import { CartIcon, CalendarIcon } from '@shared/ui/icons'
import { ROUTES } from '@app/router/routes'
import './DashboardPage.css'

interface NavItem {
  label: string
  description: string
  icon: React.ReactNode
  route: string
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Lista de la compra',
    description: 'Gestiona tus listas por supermercado',
    icon: <CartIcon width={28} height={28} />,
    route: ROUTES.SHOPPING,
  },
  {
    label: 'Menú semanal',
    description: 'Planifica los platos de la semana',
    icon: <CalendarIcon width={28} height={28} />,
    route: ROUTES.MENU,
  },
]

export const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <PageLayout withHeader>
      <nav className="dashboard-nav anim-card" aria-label="Secciones de la app">
        <h1 className="dashboard-nav-title anim-1">
          <span className="dashboard-nav-subtitle">Tu espacio</span>
          Deja que tu casa fluya
        </h1>
        <ul className="dashboard-nav-list anim-2" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.route}>
              <button
                type="button"
                className="dashboard-nav-item"
                onClick={() => { void navigate(item.route) }}
              >
                <span className="dashboard-nav-item__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="dashboard-nav-item__text">
                  <span className="dashboard-nav-item__label">{item.label}</span>
                  <span className="dashboard-nav-item__desc">{item.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </PageLayout>
  )
}
