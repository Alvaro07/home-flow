import { useState } from 'react'
import { useShoppingItems } from '../model/useShoppingItems'
import './ShoppingTabPanel.css'

interface Props {
  supermarketId: string
}

const SKELETON_ROWS = 4

export const ShoppingTabPanel = ({ supermarketId }: Props) => {
  const { items, isLoading, create, removeMany } = useShoppingItems(supermarketId)
  const [newItemName, setNewItemName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [duplicateError, setDuplicateError] = useState(false)

  const handleAdd = () => {
    const trimmed = newItemName.trim()
    if (!trimmed) return
    const isDuplicate = items.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      setDuplicateError(true)
      return
    }
    create.mutate({ supermarket_id: supermarketId, name: trimmed, position: (items[0]?.position ?? -1) + 1 })
    setNewItemName('')
    setDuplicateError(false)
  }

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((i) => i !== id))
  }

  const handleRemoveSelected = () => {
    removeMany.mutate(selectedIds)
    setSelectedIds([])
  }

  return (
    <div className="tab-panel">
      {/* Add item form */}
      <div className="tab-panel__add-form">
        <div className="tab-panel__input-wrapper">
          <input
            className={`field-input tab-panel__input${duplicateError ? ' tab-panel__input--error' : ''}`}
            value={newItemName}
            onChange={(e) => { setNewItemName(e.target.value); setDuplicateError(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            placeholder="Añade un artículo…"
            disabled={create.isPending}
          />
          {duplicateError && (
            <p className="tab-panel__input-error">Este artículo ya está en la lista</p>
          )}
        </div>
        <button
          className="btn-primary tab-panel__add-btn"
          onClick={handleAdd}
          disabled={!newItemName.trim() || create.isPending}
          type="button"
        >
          {create.isPending && <span className="btn-spinner" aria-hidden="true" />}
          <span className="tab-panel__add-label">Añadir</span>
          <span className="tab-panel__add-icon" aria-hidden="true">+</span>
        </button>
      </div>

      {/* Item list */}
      <div className="tab-panel__list-wrapper">
        {(create.isPending || removeMany.isPending) && (
          <div className="tab-panel__list-overlay" aria-hidden="true">
            <span className="tab-panel__list-spinner" />
          </div>
        )}
        {isLoading ? (
          <ul className="tab-panel__list" aria-busy="true" aria-label="Cargando artículos">
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <li key={i} className="tab-panel__skeleton" style={{ '--skeleton-delay': `${String(i * 0.08)}s` } as React.CSSProperties} />
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="tab-panel__empty">
            Lista vacía — añade tu primer artículo
          </div>
        ) : (
          <ul className="tab-panel__list" role="list">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id)
              return (
                <li
                  key={item.id}
                  className={`tab-panel__item${isSelected ? ' tab-panel__item--selected' : ''}`}
                >
                  <label className="tab-panel__item-label">
                    <input
                      type="checkbox"
                      className="tab-panel__checkbox"
                      checked={isSelected}
                      onChange={(e) => { handleToggle(item.id, e.target.checked) }}
                    />
                    <span className="tab-panel__item-name">{item.name}</span>
                    {item.quantity && (
                      <span className="tab-panel__item-qty">{item.quantity}</span>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Bulk delete action */}
      {selectedIds.length > 0 && (
        <div className="tab-panel__actions">
          <button
            className="btn-danger"
            onClick={handleRemoveSelected}
            disabled={removeMany.isPending}
            type="button"
          >
            {removeMany.isPending
              ? <span className="btn-spinner btn-spinner--danger" aria-hidden="true" />
              : <i className="pi pi-trash" />
            }
            Eliminar seleccionados ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  )
}
