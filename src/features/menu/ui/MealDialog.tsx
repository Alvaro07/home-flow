import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWeeklyMenu } from '../model/useWeeklyMenu'
import { useDishes } from '@features/dishes'
import { useSupermarkets, shoppingItemsApi } from '@features/shopping'
import type { DayOfWeek, MealType } from '../api/menu.types'
import type { WeeklyMenuSlot } from '../api/menuApi'
import './MealDialog.css'

const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

const MEAL_NAMES: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
}

interface Props {
  visible: boolean
  day: DayOfWeek
  mealType: MealType
  slot?: WeeklyMenuSlot
  onHide: () => void
}

type Mode = 'text' | 'dish'

export const MealDialog = ({ visible, day, mealType, slot, onHide }: Props) => {
  const initialMode: Mode = slot?.dish_id ? 'dish' : 'text'
  const [mode, setMode] = useState<Mode>(initialMode)
  const [description, setDescription] = useState(slot?.description ?? '')
  const [selectedDishId, setSelectedDishId] = useState<string>(slot?.dish_id ?? '')
  const [itemName, setItemName] = useState('')
  const [selectedSupermarketId, setSelectedSupermarketId] = useState<string>('')

  const { dishes, isLoading: dishesLoading } = useDishes()
  const { supermarkets, isLoading: supermarketsLoading } = useSupermarkets()
  const { upsert, clear } = useWeeklyMenu()
  const queryClient = useQueryClient()

  const defaultSupermarketId = supermarkets.find((s) => s.is_default)?.id ?? supermarkets[0]?.id ?? ''
  const effectiveSupermarketId = selectedSupermarketId || defaultSupermarketId

  const addItem = useMutation({
    mutationFn: () =>
      shoppingItemsApi.create({
        supermarket_id: effectiveSupermarketId,
        name: itemName.trim(),
        position: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] })
      setItemName('')
    },
  })

  const canSaveMeal = mode === 'text' ? description.trim().length > 0 : selectedDishId.length > 0
  const canAddItem = itemName.trim().length > 0 && effectiveSupermarketId.length > 0

  const handleSaveMeal = () => {
    if (mode === 'text') {
      upsert.mutate({
        day_of_week: day,
        meal_type: mealType,
        description: description.trim(),
        dish_id: null,
      })
    } else {
      upsert.mutate({
        day_of_week: day,
        meal_type: mealType,
        dish_id: selectedDishId,
        description: null,
      })
    }
  }

  const handleClearMeal = () => {
    if (!slot?.id) return
    clear.mutateAsync(slot.id)
      .then(() => {
        setDescription('')
        setSelectedDishId('')
        setMode('text')
      })
      .catch(() => { /* error gestionado via clear.isError */ })
  }

  const handleAddItem = () => {
    if (!canAddItem) return
    addItem.mutate()
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`${DAY_NAMES[day]} — ${MEAL_NAMES[mealType]}`}
      className="meal-dialog"
      draggable={false}
      resizable={false}
    >
      <div className="meal-dialog__content">

        {/* ─── Meal section ─────────────────────────────── */}
        <section className="meal-dialog__section">
          <p className="meal-dialog__section-label">Plato</p>

          <div className="meal-dialog__mode-toggle" role="group" aria-label="Tipo de entrada">
            <button
              type="button"
              className={`meal-dialog__mode-btn${mode === 'text' ? ' meal-dialog__mode-btn--active' : ''}`}
              onClick={() => setMode('text')}
            >
              Texto libre
            </button>
            <button
              type="button"
              className={`meal-dialog__mode-btn${mode === 'dish' ? ' meal-dialog__mode-btn--active' : ''}`}
              onClick={() => setMode('dish')}
            >
              <i className="pi pi-book" aria-hidden="true" />
              Recetas
            </button>
          </div>

          {mode === 'text' ? (
            <input
              className="field-input"
              value={description}
              onChange={(e) => { setDescription(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSaveMeal) handleSaveMeal() }}
              placeholder="¿Qué vas a preparar?"
              autoFocus
              disabled={upsert.isPending}
            />
          ) : (
            <select
              className="field-input field-select"
              value={selectedDishId}
              onChange={(e) => { setSelectedDishId(e.target.value) }}
              disabled={dishesLoading || upsert.isPending}
              aria-label="Seleccionar receta"
            >
              <option value="">
                {dishesLoading ? 'Cargando recetas…' : dishes.length === 0 ? 'Aún no tienes recetas' : 'Selecciona un plato'}
              </option>
              {dishes.map((dish) => (
                <option key={dish.id} value={dish.id}>{dish.name}</option>
              ))}
            </select>
          )}

          <div className="meal-dialog__meal-actions">
            <button
              type="button"
              className="btn-primary meal-dialog__save-btn"
              onClick={handleSaveMeal}
              disabled={!canSaveMeal || upsert.isPending}
            >
              {upsert.isPending && <span className="btn-spinner" aria-hidden="true" />}
              {upsert.isSuccess ? '✓ Guardado' : 'Guardar plato'}
            </button>
            {slot?.id && (
              <button
                type="button"
                className="btn-danger"
                onClick={handleClearMeal}
                disabled={clear.isPending}
              >
                {clear.isPending
                  ? <span className="btn-spinner btn-spinner--danger" aria-hidden="true" />
                  : <i className="pi pi-trash" aria-hidden="true" />
                }
                Quitar
              </button>
            )}
          </div>

          {upsert.isError && (
            <p className="error-banner" role="alert">
              {upsert.error instanceof Error ? upsert.error.message : 'Error al guardar el plato'}
            </p>
          )}
        </section>

        {/* ─── Divider ──────────────────────────────────── */}
        <div className="meal-dialog__divider" aria-hidden="true" />

        {/* ─── Shopping section ─────────────────────────── */}
        <section className="meal-dialog__section">
          <p className="meal-dialog__section-label">Añadir a la compra</p>

          <div className="meal-dialog__cart-row">
            <input
              className="field-input meal-dialog__cart-input"
              value={itemName}
              onChange={(e) => { setItemName(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem() }}
              placeholder="Ingrediente o producto…"
              disabled={addItem.isPending}
              aria-label="Nombre del artículo"
            />
            <select
              className="field-input field-select meal-dialog__cart-select"
              value={effectiveSupermarketId}
              onChange={(e) => { setSelectedSupermarketId(e.target.value) }}
              disabled={supermarketsLoading}
              aria-label="Supermercado"
            >
              {supermarkets.length === 0 && (
                <option value="">
                  {supermarketsLoading ? 'Cargando…' : 'Sin listas'}
                </option>
              )}
              {supermarkets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary meal-dialog__cart-btn"
              onClick={handleAddItem}
              disabled={!canAddItem || addItem.isPending}
              aria-label="Añadir artículo a la lista"
            >
              {addItem.isPending
                ? <span className="btn-spinner" aria-hidden="true" />
                : <i className="pi pi-plus" aria-hidden="true" />
              }
              Añadir
            </button>
          </div>

          {addItem.isSuccess && (
            <p className="success-banner meal-dialog__cart-feedback" role="status">
              ✓ Añadido a la lista de la compra
            </p>
          )}
          {addItem.isError && (
            <p className="error-banner meal-dialog__cart-feedback" role="alert">
              {addItem.error instanceof Error ? addItem.error.message : 'Error al añadir el artículo'}
            </p>
          )}
        </section>

        {/* ─── Footer ───────────────────────────────────── */}
        <div className="meal-dialog__footer">
          <button type="button" className="btn-secondary" onClick={onHide}>
            Cerrar
          </button>
        </div>
      </div>
    </Dialog>
  )
}
