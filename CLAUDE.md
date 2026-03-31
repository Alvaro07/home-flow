# HomeFlow — CLAUDE.md

## Proyecto

**HomeFlow** — app de gestión del hogar. *Deja que tu casa fluya.*

App React + Supabase para gestionar la lista de la compra, el menú semanal y una biblioteca de platos guardados.

## Stack

React 18 · TypeScript · Vite · Supabase JS · Zustand · TanStack Query · PrimeReact + PrimeFlex · React Router v7 · Zod · Vitest · MSW

## Arquitectura — Feature-Sliced Design (FSD)

```
app → pages → widgets → features → entities → shared
```

Dependencias unidireccionales: las capas superiores importan de las inferiores, nunca al revés.

### Path aliases

```
@app      → src/app
@pages    → src/pages
@features → src/features
@widgets  → src/widgets
@shared   → src/shared
```

### Estructura de cada feature

```
features/<name>/
  api/      # comunicación con Supabase
  model/    # store Zustand + hooks
  ui/       # componentes React
  index.ts  # barrel export
```

## Modelo de datos (Supabase)

- `profiles` — extiende auth.users, creado via trigger al registrarse
- `supermarkets` — user_id, name, color, position
- `shopping_items` — user_id, supermarket_id, name, quantity (texto libre), is_checked, position
- `weekly_menus` — user_id, day_of_week (0-6), meal_type (breakfast/lunch/dinner), description, updated_at. UNIQUE(user_id, day_of_week, meal_type). Solo semana actual, siempre UPSERT.
- `dishes` — user_id, name, notes
- `dish_tags` — dish_id, user_id, tag. UNIQUE(dish_id, tag)

RLS habilitado en todas las tablas. Cada usuario solo ve sus propios datos.

## Features FSD

| Feature | Tablas | Estado |
|---|---|---|
| `auth` | auth.users, profiles | Completo (heredado del template) |
| `shopping` | supermarkets, shopping_items | Pendiente |
| `menu` | weekly_menus | Pendiente |
| `dishes` | dishes, dish_tags | Pendiente |

## Páginas

| Página | Ruta | Estado |
|---|---|---|
| `LoginPage` | `/login` | Completo |
| `RegisterPage` | `/register` | Completo |
| `NotFoundPage` | `*` | Completo |
| `HomePage` | `/` | Pendiente |
| `ShoppingPage` | `/shopping` | Pendiente |
| `MenuPage` | `/menu` | Pendiente |
| `DishesPage` | `/dishes` | Pendiente |

## Convenciones de código

- Los métodos de API devuelven `{ data, error }` — sin excepciones, siempre discriminated union
- Los selectores de Zustand se definen como funciones separadas fuera del store
- Las variables de entorno se validan con Zod en `shared/config/env.ts`
- Los errores de Supabase se mapean a mensajes en español en la capa `api/`
- Commits: Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, etc.)

## Comandos frecuentes

```bash
yarn dev              # servidor de desarrollo
yarn build            # build de producción
yarn test:run         # tests en CI
yarn test             # tests en modo watch
yarn typecheck        # type check sin emitir
yarn supabase:types   # regenerar tipos desde Supabase
```

## Variables de entorno

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
