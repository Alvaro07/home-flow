import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { useWeeklyMenu } from '../model/useWeeklyMenu'
import type { DayOfWeek, MealType } from '../api/menu.types'
import type { WeeklyMenuSlot } from '../api/menuApi'
import { MealDialog } from './MealDialog'
import './WeeklyMenuGrid.css'

const DAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0]

const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner']

const MEAL_META: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: 'Desayuno', icon: '☀' },
  lunch:     { label: 'Comida',   icon: '◉' },
  dinner:    { label: 'Cena',     icon: '☾' },
}

const SKELETON_COUNT = 7

interface MealDialogState {
  day: DayOfWeek
  mealType: MealType
  slot?: WeeklyMenuSlot
}

const getTodayDow = (): DayOfWeek => new Date().getDay() as DayOfWeek

export const WeeklyMenuGrid = () => {
  const { slots, isLoading, clearDay, clearWeek } = useWeeklyMenu()
  const [mealDialog, setMealDialog] = useState<MealDialogState | null>(null)
  const [confirmClearWeek, setConfirmClearWeek] = useState(false)
  const [confirmClearDay, setConfirmClearDay] = useState<DayOfWeek | null>(null)
  const today = getTodayDow()

  const slotMap = new Map(slots.map((s) => [`${String(s.day_of_week)}-${s.meal_type}`, s]))
  const getSlot = (day: DayOfWeek, meal: MealType) => slotMap.get(`${String(day)}-${meal}`)
  const dayHasContent = (day: DayOfWeek) => MEAL_ORDER.some((meal) => getSlot(day, meal))

  const openMealDialog = (day: DayOfWeek, mealType: MealType) => {
    setMealDialog({ day, mealType, slot: getSlot(day, mealType) })
  }

  const handleConfirmClearDay = () => {
    if (confirmClearDay === null) return
    clearDay.mutate(confirmClearDay, { onSuccess: () => { setConfirmClearDay(null) } })
  }

  const handleConfirmClearWeek = () => {
    clearWeek.mutate(undefined, { onSuccess: () => { setConfirmClearWeek(false) } })
  }

  return (
    <>
      {/* Toolbar */}
      {!isLoading && (
        <div className="weekly-grid__toolbar">
          <h1 className="weekly-grid__title">Menú semanal</h1>
          <button
            type="button"
            className="btn-danger weekly-grid__clear-week-btn"
            onClick={() => { setConfirmClearWeek(true) }}
            disabled={slots.length === 0 || clearWeek.isPending}
          >
            {clearWeek.isPending
              ? <span className="btn-spinner btn-spinner--danger" aria-hidden="true" />
              : <i className="pi pi-trash" aria-hidden="true" />
            }
            Borrar menú
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="weekly-grid" role="list" aria-label="Menú semanal">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="day-card day-card--skeleton"
                aria-hidden="true"
                style={{ '--skeleton-delay': `${String(i * 0.05)}s` } as React.CSSProperties}
              >
                <div className="day-card__skeleton-header" />
                {MEAL_ORDER.map((_, j) => (
                  <div key={j} className="day-card__skeleton-row" />
                ))}
              </div>
            ))
          : DAY_ORDER.map((day, index) => {
              const isToday = day === today
              const hasContent = dayHasContent(day)
              return (
                <article
                  key={day}
                  role="listitem"
                  className={`day-card anim-card${isToday ? ' day-card--today' : ''}`}
                  style={{ animationDelay: `${String(index * 0.06)}s` }}
                  aria-label={`${DAY_NAMES[day]}${isToday ? ', hoy' : ''}`}
                >
                  <header className="day-card__header">
                    <span className="day-card__name">{DAY_NAMES[day]}</span>
                    <div className="day-card__header-right">
                      {isToday && <span className="day-card__today-badge">hoy</span>}
                      <button
                        type="button"
                        className="btn-danger day-card__delete-btn"
                        onClick={() => { setConfirmClearDay(day) }}
                        disabled={!hasContent || clearDay.isPending}
                        aria-label={`Borrar ${DAY_NAMES[day]}`}
                      >
                        <i className="pi pi-trash" aria-hidden="true" />
                        Borrar
                      </button>
                    </div>
                  </header>

                  <div className="day-card__meals">
                    {MEAL_ORDER.map((meal) => {
                      const slot = getSlot(day, meal)
                      const meta = MEAL_META[meal]
                      const label = slot?.dish?.name ?? slot?.description ?? null
                      return (
                        <button
                          key={meal}
                          type="button"
                          className={`meal-slot meal-slot--${meal}${label ? ' meal-slot--filled' : ''}`}
                          onClick={() => { openMealDialog(day, meal) }}
                          aria-label={`${meta.label}: ${label ?? 'vacío, pulsa para añadir'}`}
                        >
                          <span className="meal-slot__header">
                            <span className="meal-slot__icon" aria-hidden="true">{meta.icon}</span>
                            <span className="meal-slot__label">{meta.label}</span>
                          </span>
                          {label
                            ? <span className="meal-slot__value">{label}</span>
                            : <span className="meal-slot__empty" aria-hidden="true">Añadir…</span>
                          }
                        </button>
                      )
                    })}
                  </div>
                </article>
              )
            })
        }
      </div>

      {/* Meal edit dialog */}
      {mealDialog && (
        <MealDialog
          key={`${String(mealDialog.day)}-${mealDialog.mealType}`}
          visible
          day={mealDialog.day}
          mealType={mealDialog.mealType}
          slot={mealDialog.slot}
          onHide={() => { setMealDialog(null) }}
        />
      )}

      {/* Confirm clear day */}
      <Dialog
        visible={confirmClearDay !== null}
        onHide={() => { setConfirmClearDay(null) }}
        header="Borrar día"
        className="supermarket-dialog"
        draggable={false}
        resizable={false}
        blockScroll
      >
        <div className="supermarket-dialog__content">
          <p className="weekly-grid__confirm-msg">
            ¿Borrar todos los platos del{' '}
            <strong>{confirmClearDay !== null ? DAY_NAMES[confirmClearDay] : ''}</strong>?
            No podrás recuperarlos.
          </p>
          <div className="supermarket-dialog__actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setConfirmClearDay(null) }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleConfirmClearDay}
              disabled={clearDay.isPending}
            >
              {clearDay.isPending
                ? <span className="btn-spinner btn-spinner--danger" aria-hidden="true" />
                : null
              }
              Borrar
            </button>
          </div>
        </div>
      </Dialog>

      {/* Confirm clear week */}
      <Dialog
        visible={confirmClearWeek}
        onHide={() => { setConfirmClearWeek(false) }}
        header="Borrar menú completo"
        className="supermarket-dialog"
        draggable={false}
        resizable={false}
        blockScroll
      >
        <div className="supermarket-dialog__content">
          <p className="weekly-grid__confirm-msg">
            ¿Borrar <strong>todos los platos del menú</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="supermarket-dialog__actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setConfirmClearWeek(false) }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleConfirmClearWeek}
              disabled={clearWeek.isPending}
            >
              {clearWeek.isPending
                ? <span className="btn-spinner btn-spinner--danger" aria-hidden="true" />
                : null
              }
              Borrar todo
            </button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
