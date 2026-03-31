import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@shared/ui/PageLayout'
import { ROUTES } from '@app/router/routes'

export const ShoppingPage = () => {
  const navigate = useNavigate()

  return (
    <PageLayout>
      <div className="glass-card anim-card">
        <h1 className="card-title anim-1">Lista de la compra</h1>
        <button
          className="btn-secondary anim-2"
          onClick={() => {
            void navigate(ROUTES.DASHBOARD)
          }}
        >
          ← Volver
        </button>
      </div>
    </PageLayout>
  )
}
