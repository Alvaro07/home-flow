import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import type { Supermarket } from '../api/supermarketsApi'
import './SupermarketDialog.css'

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  supermarket?: Supermarket
  isLoading?: boolean
  onSave: (name: string) => void
  onHide: () => void
}

export const SupermarketDialog = ({
  visible,
  mode,
  supermarket,
  isLoading,
  onSave,
  onHide,
}: Props) => {
  // Initialized once on mount — the parent uses `key` to force a remount
  // when mode or supermarket changes, so this value is always fresh
  const [name, setName] = useState(mode === 'edit' && supermarket ? supermarket.name : '')

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={mode === 'create' ? 'Nuevo supermercado' : 'Editar supermercado'}
      className="supermarket-dialog"
      draggable={false}
      resizable={false}
      blockScroll
    >
      <div className="supermarket-dialog__content">
        <input
          className="field-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
          placeholder="Nombre del supermercado"
          autoFocus
        />
        <div className="supermarket-dialog__actions">
          <button className="btn-secondary" onClick={onHide} type="button">
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
            type="button"
          >
            {mode === 'create' ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
