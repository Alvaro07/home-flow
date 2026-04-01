import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabView, TabPanel } from 'primereact/tabview'
import { Dialog } from 'primereact/dialog'
import { PageLayout } from '@shared/ui/PageLayout'
import { useSupermarkets } from '@features/shopping/model/useSupermarkets'
import { SupermarketDialog } from '@features/shopping/ui/SupermarketDialog'
import { ShoppingTabPanel } from '@features/shopping/ui/ShoppingTabPanel'
import type { Supermarket } from '@features/shopping/api/supermarketsApi'
import { ROUTES } from '@app/router/routes'
import './ShoppingPage.css'

interface DialogState {
  mode: 'create' | 'edit'
  supermarket?: Supermarket
}

interface ConfirmDeleteState {
  supermarket: Supermarket
  tabIndex: number
}

export const ShoppingPage = () => {
  const navigate = useNavigate()
  const { supermarkets, isLoading, create, update, remove } = useSupermarkets()
  const [activeIndex, setActiveIndex] = useState(0)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(null)

  const defaultTab = supermarkets.find((s) => s.is_default)
  const customTabs = supermarkets
    .filter((s) => !s.is_default)
    .sort((a, b) => a.position - b.position)
  const orderedTabs = defaultTab ? [defaultTab, ...customTabs] : customTabs

  const handleCreate = (name: string) => {
    create.mutate({ name, position: customTabs.length })
    setDialog(null)
  }

  const handleUpdate = (name: string) => {
    if (!dialog?.supermarket) return
    update.mutate({ id: dialog.supermarket.id, input: { name } })
    setDialog(null)
  }

  const handleRemove = (sm: Supermarket, tabIndex: number) => {
    setConfirmDelete({ supermarket: sm, tabIndex })
  }

  const handleConfirmedRemove = () => {
    if (!confirmDelete) return
    const { supermarket, tabIndex } = confirmDelete
    if (activeIndex >= tabIndex) setActiveIndex(Math.max(0, tabIndex - 1))
    remove.mutate(supermarket.id)
    setConfirmDelete(null)
  }

  const renderTabHeader = (sm: Supermarket, index: number) => (
    <span className="shopping-tab-header">
      <span className="shopping-tab-header__name">{sm.name}</span>
      {!sm.is_default && (
        <span className="shopping-tab-header__actions">
          <button
            type="button"
            className="shopping-tab-header__btn"
            aria-label={`Editar ${sm.name}`}
            onClick={(e) => {
              e.stopPropagation()
              setDialog({ mode: 'edit', supermarket: sm })
            }}
          >
            <i className="pi pi-pencil" />
          </button>
          <button
            type="button"
            className="shopping-tab-header__btn shopping-tab-header__btn--delete"
            aria-label={`Eliminar ${sm.name}`}
            onClick={(e) => {
              e.stopPropagation()
              handleRemove(sm, index)
            }}
          >
            <i className="pi pi-times" />
          </button>
        </span>
      )}
    </span>
  )

  return (
    <PageLayout withHeader>
      <div className="glass-card shopping-page anim-card">
        {/* Back */}
        <button
          type="button"
          className="shopping-page__back anim-1"
          onClick={() => {
            void navigate(ROUTES.DASHBOARD)
          }}
        >
          <i className="pi pi-arrow-left" />
          Volver
        </button>

        {/* Header */}
        <div className="shopping-page__header anim-2">
          <h1 className="card-title">Lista de la compra</h1>
          <button
            type="button"
            className="btn-primary shopping-page__add-btn"
            onClick={() => {
              setDialog({ mode: 'create' })
            }}
            disabled={create.isPending}
          >
            {create.isPending ? (
              <span className="btn-spinner" aria-hidden="true" />
            ) : (
              <i className="pi pi-plus" />
            )}
            Nuevo super
          </button>
        </div>

        {/* Tabs */}
        {isLoading ? (
          <div
            className="shopping-page__tabs-skeleton"
            aria-busy="true"
            aria-label="Cargando supermercados"
          >
            <div className="shopping-page__skeleton-nav">
              {[80, 110, 95].map((w, i) => (
                <div
                  key={i}
                  className="shopping-page__skeleton-tab"
                  style={
                    { width: w, '--skeleton-delay': `${String(i * 0.08)}s` } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <div className="shopping-page__skeleton-panel">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="shopping-page__skeleton-row"
                  style={{ '--skeleton-delay': `${String(i * 0.06)}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        ) : (
          <TabView
            className="shopping-tabs anim-3"
            activeIndex={activeIndex}
            onTabChange={(e) => {
              setActiveIndex(e.index)
            }}
          >
            {orderedTabs.map((sm, index) => (
              <TabPanel key={sm.id} header={renderTabHeader(sm, index)}>
                <ShoppingTabPanel supermarketId={sm.id} />
              </TabPanel>
            ))}
          </TabView>
        )}

        {/* Create / edit supermarket dialog */}
        <SupermarketDialog
          key={dialog ? `${dialog.mode}-${dialog.supermarket?.id ?? 'new'}` : 'closed'}
          visible={dialog !== null}
          mode={dialog?.mode ?? 'create'}
          supermarket={dialog?.supermarket}
          isLoading={create.isPending || update.isPending}
          onSave={dialog?.mode === 'edit' ? handleUpdate : handleCreate}
          onHide={() => {
            setDialog(null)
          }}
        />

        {/* Confirm delete dialog */}
        <Dialog
          visible={confirmDelete !== null}
          onHide={() => {
            setConfirmDelete(null)
          }}
          header="Eliminar supermercado"
          className="supermarket-dialog"
          draggable={false}
          resizable={false}
        >
          <div className="supermarket-dialog__content">
            <p className="shopping-page__confirm-msg">
              ¿Eliminar <strong>{confirmDelete?.supermarket.name}</strong>? Se borrarán también
              todos sus artículos y no podrás recuperarlos.
            </p>
            <div className="supermarket-dialog__actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setConfirmDelete(null)
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmedRemove}
                disabled={remove.isPending}
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </PageLayout>
  )
}
