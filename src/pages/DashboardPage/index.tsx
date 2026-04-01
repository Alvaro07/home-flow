import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@shared/ui/PageLayout'
import { CartIcon } from '@shared/ui/icons'
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
    icon: <CartIcon width={20} height={20} />,
    route: ROUTES.SHOPPING,
  },
]

export const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <PageLayout withHeader>
      <div className="glass-card dashboard-card anim-card">
        <nav aria-label="Secciones de la app">
          <h2 className="dashboard-nav-title anim-1">Tu espacio</h2>
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
                  <i className="pi pi-chevron-right dashboard-nav-item__arrow" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageLayout>
  )
}
