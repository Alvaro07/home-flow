import { useState, useRef } from 'react'
import { Dialog } from 'primereact/dialog'
import type { DishWithTags } from '../api/dishes.types'
import './DishDialog.css'

interface SaveData {
  name: string
  notes: string
  tags: string[]
}

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  dish?: DishWithTags
  availableTags: string[]
  isLoading?: boolean
  onSave: (data: SaveData) => void
  onHide: () => void
}

export const DishDialog = ({
  visible,
  mode,
  dish,
  availableTags,
  isLoading,
  onSave,
  onHide,
}: Props) => {
  const [name, setName] = useState(mode === 'edit' && dish ? dish.name : '')
  const [notes, setNotes] = useState(mode === 'edit' && dish ? (dish.notes ?? '') : '')
  const [tags, setTags] = useState(mode === 'edit' && dish ? dish.tags : [])
  const [tagInput, setTagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const suggestions = availableTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t),
  )

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (!trimmed || tags.includes(trimmed)) return
    setTags((prev) => [...prev, trimmed])
    setTagInput('')
    setShowSuggestions(false)
    tagInputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ name: trimmed, notes: notes.trim(), tags })
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={mode === 'create' ? 'Nuevo plato' : 'Editar plato'}
      className="dish-dialog"
      draggable={false}
      resizable={false}
      blockScroll
    >
      <div className="dish-dialog__content">
        {/* Name */}
        <div className="dish-dialog__field">
          <label className="dish-dialog__label" htmlFor="dish-name">Nombre</label>
          <input
            id="dish-name"
            className="field-input"
            value={name}
            onChange={(e) => { setName(e.target.value) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder="Ej. Paella valenciana"
            autoFocus
          />
        </div>

        {/* Notes */}
        <div className="dish-dialog__field">
          <label className="dish-dialog__label" htmlFor="dish-notes">Notas <span className="dish-dialog__optional">(opcional)</span></label>
          <textarea
            id="dish-notes"
            className="field-input dish-dialog__textarea"
            value={notes}
            onChange={(e) => { setNotes(e.target.value) }}
            placeholder="Ingredientes especiales, tiempo de preparación..."
            rows={3}
          />
        </div>

        {/* Tags */}
        <div className="dish-dialog__field">
          <label className="dish-dialog__label">Tags <span className="dish-dialog__optional">(opcional)</span></label>
          <div className="dish-dialog__tag-input-wrapper">
            <div className="dish-dialog__tag-chips">
              {tags.map((tag) => (
                <span key={tag} className="dish-dialog__chip">
                  {tag}
                  <button
                    type="button"
                    className="dish-dialog__chip-remove"
                    aria-label={`Quitar tag ${tag}`}
                    onClick={() => { removeTag(tag) }}
                  >
                    <i className="pi pi-times" />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                className="dish-dialog__tag-input"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onKeyDown={handleTagKeyDown}
                onFocus={() => { if (tagInput) setShowSuggestions(true) }}
                onBlur={() => { setTimeout(() => { setShowSuggestions(false) }, 150) }}
                placeholder={tags.length === 0 ? 'Escribe un tag y pulsa Enter…' : ''}
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="dish-dialog__suggestions">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="dish-dialog__suggestion-item"
                      onMouseDown={(e) => { e.preventDefault() }}
                      onClick={() => { addTag(s) }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="dish-dialog__actions">
          <button className="btn-secondary" onClick={onHide} type="button">
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!name.trim() || isLoading}
            type="button"
          >
            {isLoading ? <span className="btn-spinner" aria-hidden="true" /> : null}
            {mode === 'create' ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
