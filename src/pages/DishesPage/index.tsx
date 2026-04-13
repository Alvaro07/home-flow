import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from 'primereact/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { PageLayout } from '@shared/ui/PageLayout'
import { useDishes } from '@features/dishes/model/useDishes'
import { useDishTags } from '@features/dishes/model/useDishTags'
import { dishTagsApi } from '@features/dishes/api/dishTagsApi'
import { PAGE_SIZE } from '@features/dishes/api/dishesApi'
import { DishDialog } from '@features/dishes/ui/DishDialog'
import type { DishWithTags } from '@features/dishes/api/dishes.types'
import { ROUTES } from '@app/router/routes'
import './DishesPage.css'

interface DialogState {
  mode: 'create' | 'edit'
  dish?: DishWithTags
}

export const DishesPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<DishWithTags | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { dishes, total, pageCount, isLoading, isFetching, create, update, remove } = useDishes({
    page,
    pageSize: PAGE_SIZE,
    tag: activeTag,
    search,
  })

  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
    }, 300)
    return () => { clearTimeout(searchTimerRef.current) }
  }, [searchInput])
  const { tags: allTags } = useDishTags()

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag)
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  const handleSave = async ({ name, notes, tags }: { name: string; notes: string; tags: string[] }) => {
    if (!dialog) return
    setIsSaving(true)

    try {
      if (dialog.mode === 'create') {
        await create.mutateAsync({ name, notes: notes || null, tags })
      } else if (dialog.dish) {
        const dish = dialog.dish
        await update.mutateAsync({ id: dish.id, input: { name, notes: notes || null } })

        const toAdd = tags.filter((t) => !dish.tags.includes(t))
        const toRemove = dish.tags.filter((t) => !tags.includes(t))

        await Promise.all([
          ...toAdd.map((t) => dishTagsApi.add(dish.id, t)),
          ...toRemove.map((t) => dishTagsApi.remove(dish.id, t)),
        ])

        await queryClient.invalidateQueries({ queryKey: ['dishes'] })
        await queryClient.invalidateQueries({ queryKey: ['dish-tags'] })
      }
    } finally {
      setIsSaving(false)
    }

    setDialog(null)
  }

  const handleConfirmedRemove = () => {
    if (!confirmDelete) return
    remove.mutate(confirmDelete.id)
    setConfirmDelete(null)
  }

  const showPagination = pageCount > 1

  return (
    <PageLayout withHeader>
      <div className="dishes-page-wrapper anim-card">
        {/* Back */}
        <button
          type="button"
          className="dishes-page__back anim-1"
          onClick={() => { void navigate(ROUTES.DASHBOARD) }}
        >
          <i className="pi pi-arrow-left" />
          Volver
        </button>

        <div className="glass-card dishes-page">
          {/* Header */}
          <div className="dishes-page__header anim-2">
            <h1 className="card-title">Platos predefinidos</h1>
            <button
              type="button"
              className="btn-primary dishes-page__add-btn"
              onClick={() => { setDialog({ mode: 'create' }) }}
              disabled={create.isPending}
            >
              {create.isPending
                ? <span className="btn-spinner" aria-hidden="true" />
                : <i className="pi pi-plus" />
              }
              Nuevo plato
            </button>
          </div>

          {/* Search */}
          <div className="dishes-page__search anim-3">
            <i className="pi pi-search dishes-page__search-icon" />
            <input
              type="search"
              className="dishes-page__search-input"
              placeholder="Buscar platos…"
              value={searchInput}
              onChange={(e) => { handleSearchChange(e.target.value) }}
            />
            {searchInput && (
              <button
                type="button"
                className="dishes-page__search-clear"
                aria-label="Limpiar búsqueda"
                onClick={handleSearchClear}
              >
                <i className="pi pi-times" />
              </button>
            )}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="dishes-page__tags anim-3" role="list" aria-label="Filtrar por tag">
              <button
                type="button"
                role="listitem"
                className={`dishes-page__tag-pill${activeTag === null ? ' dishes-page__tag-pill--active' : ''}`}
                onClick={() => { handleTagChange(null) }}
              >
                Todos
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  role="listitem"
                  className={`dishes-page__tag-pill${activeTag === tag ? ' dishes-page__tag-pill--active' : ''}`}
                  onClick={() => { handleTagChange(activeTag === tag ? null : tag) }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Dish list */}
          {isLoading ? (
            <div className="dishes-page__skeleton" aria-busy="true" aria-label="Cargando platos">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="dishes-page__skeleton-row"
                  style={{ '--skeleton-delay': `${String(i * 0.07)}s` } as React.CSSProperties}
                />
              ))}
            </div>
          ) : dishes.length === 0 ? (
            <div className="dishes-page__empty anim-3">
              {search
                ? <>Sin resultados para <strong>{search}</strong></>
                : activeTag
                  ? <>No hay platos con el tag <strong>{activeTag}</strong></>
                  : 'Aún no tienes platos guardados. ¡Crea el primero!'}
            </div>
          ) : (
            <div className="dishes-page__list-container">
              {isFetching && (
                <div className="dishes-page__list-loading" aria-label="Actualizando platos">
                  <span className="dishes-page__list-spinner" aria-hidden="true" />
                </div>
              )}
            <ul
              className={`dishes-page__list anim-3${isFetching ? ' dishes-page__list--fetching' : ''}`}
              role="list"
            >
              {dishes.map((dish) => (
                <li key={dish.id} className="dishes-page__item">
                  <div className="dishes-page__item-body">
                    <span className="dishes-page__item-name">{dish.name}</span>
                    {dish.notes && (
                      <span className="dishes-page__item-notes">{dish.notes}</span>
                    )}
                    <div className="dishes-page__item-footer">
                      <div className="dishes-page__item-tags">
                        {dish.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className={`dishes-page__item-tag${activeTag === tag ? ' dishes-page__item-tag--active' : ''}`}
                            onClick={() => { handleTagChange(activeTag === tag ? null : tag) }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="dishes-page__item-actions">
                        <button
                          type="button"
                          className="dishes-page__action-btn"
                          aria-label={`Editar ${dish.name}`}
                          onClick={() => { setDialog({ mode: 'edit', dish }) }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                        <button
                          type="button"
                          className="dishes-page__action-btn dishes-page__action-btn--delete"
                          aria-label={`Eliminar ${dish.name}`}
                          onClick={() => { setConfirmDelete(dish) }}
                        >
                          <i className="pi pi-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          )}

          {/* Pagination */}
          {showPagination && (
            <div className="dishes-page__pagination">
              <button
                type="button"
                className="dishes-page__page-btn"
                onClick={() => { setPage((p) => p - 1) }}
                disabled={page === 0}
                aria-label="Página anterior"
              >
                <i className="pi pi-chevron-left" />
              </button>
              <span className="dishes-page__page-info">
                {page + 1} / {pageCount}
                <span className="dishes-page__page-total">· {total} platos</span>
              </span>
              <button
                type="button"
                className="dishes-page__page-btn"
                onClick={() => { setPage((p) => p + 1) }}
                disabled={page >= pageCount - 1}
                aria-label="Página siguiente"
              >
                <i className="pi pi-chevron-right" />
              </button>
            </div>
          )}
        </div>

        {/* Create / edit dialog */}
        <DishDialog
          key={dialog ? `${dialog.mode}-${dialog.dish?.id ?? 'new'}` : 'closed'}
          visible={dialog !== null}
          mode={dialog?.mode ?? 'create'}
          dish={dialog?.dish}
          availableTags={allTags}
          isLoading={isSaving}
          onSave={(data) => { void handleSave(data) }}
          onHide={() => { setDialog(null) }}
        />

        {/* Confirm delete dialog */}
        <Dialog
          visible={confirmDelete !== null}
          onHide={() => { setConfirmDelete(null) }}
          header="Eliminar plato"
          className="dish-dialog"
          draggable={false}
          resizable={false}
        >
          <div className="dish-dialog__content">
            <p className="dishes-page__confirm-msg">
              ¿Eliminar <strong>{confirmDelete?.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="dish-dialog__actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setConfirmDelete(null) }}
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
