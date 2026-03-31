# Base de datos — HomeFlow

## Visión general

El esquema está diseñado en torno al usuario. Cada tabla tiene un `user_id` que referencia a `profiles.id`, y RLS (Row Level Security) garantiza que cada usuario solo puede leer y escribir sus propios datos. La autenticación la gestiona Supabase Auth (`auth.users`); `profiles` es la extensión pública de ese sistema.

---

## Diagrama de relaciones

```
auth.users (Supabase Auth)
    │
    │ trigger on INSERT
    ▼
profiles
    │
    ├──────────────────┬─────────────────────┬───────────────────────┐
    │                  │                     │                       │
    ▼                  ▼                     ▼                       ▼
supermarkets       dishes              weekly_menus           (sin tabla propia)
    │                  │
    ▼                  ▼
shopping_items     dish_tags
```

---

## Tablas

### `profiles`

Extensión pública de `auth.users`. Se crea automáticamente al registrarse mediante un trigger de Postgres.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK. Mismo valor que `auth.users.id` |
| `full_name` | `text \| null` | Nombre visible del usuario |
| `avatar_url` | `text \| null` | URL del avatar |
| `created_at` | `timestamptz \| null` | Fecha de creación |

**Por qué existe:** Supabase Auth vive en el schema `auth`, inaccesible desde el cliente. `profiles` expone en `public` solo los datos que la app necesita mostrar, manteniendo separados los datos de autenticación (email, password hash) de los datos de perfil.

---

### `supermarkets`

Los supermercados que crea el usuario. Cada uno genera una tab en la pantalla de lista de la compra.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, generado automáticamente |
| `user_id` | `uuid` | FK → `profiles.id` |
| `name` | `text` | Nombre del supermercado |
| `color` | `text \| null` | Color de la tab (hex o nombre CSS) |
| `position` | `int4` | Orden de las tabs. Default `0` |
| `is_default` | `bool` | Si es el supermercado genérico del usuario. Default `false` |
| `created_at` | `timestamptz \| null` | Fecha de creación |

**Supermercado por defecto:** Al registrarse cada usuario, un trigger de Postgres crea automáticamente un supermercado con `name = 'General'` e `is_default = true`. Este supermercado siempre existe y sirve para añadir productos que no pertenecen a ningún supermercado concreto. La UI lo muestra siempre como primera tab y no permite borrarlo ni cambiarle el `is_default`.

**Lógica de posición:** `position` es un entero que representa el orden de las tabs. El supermercado por defecto siempre tiene `position = 0`. Al crear un supermercado nuevo se asigna `position = total_actual`. Al reordenar se actualizan los valores de `position` de los afectados.

---

### `shopping_items`

Los ítems dentro de cada supermercado.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, generado automáticamente |
| `user_id` | `uuid` | FK → `profiles.id` |
| `supermarket_id` | `uuid` | FK → `supermarkets.id` |
| `name` | `text` | Nombre del ítem |
| `quantity` | `text \| null` | Cantidad en texto libre ("2 kg", "1 bote", etc.) |
| `is_checked` | `bool` | Si el ítem está tachado. Default `false` |
| `position` | `int4` | Orden dentro del supermercado. Default `0` |
| `created_at` | `timestamptz \| null` | Fecha de creación |

**`quantity` como texto libre:** La cantidad no es un número sino un string para dar flexibilidad total ("un poco", "2 kg", "x3"). No hay unidades predefinidas.

**Borrado de marcados:** La operación "limpiar lista" hace un `DELETE WHERE supermarket_id = X AND is_checked = true` — no hay papelera ni soft delete.

**Cascade:** Si se borra un `supermarket`, sus `shopping_items` se borran en cascada (FK con `ON DELETE CASCADE`).

---

### `weekly_menus`

Los slots del menú semanal. Máximo 21 filas por usuario (7 días × 3 momentos).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, generado automáticamente |
| `user_id` | `uuid` | FK → `profiles.id` |
| `day_of_week` | `int4` | `0` = lunes … `6` = domingo |
| `meal_type` | `text` | `'breakfast'`, `'lunch'` o `'dinner'` |
| `description` | `text \| null` | Lo que hay en ese slot |
| `updated_at` | `timestamptz \| null` | Última modificación |

**Constraint UNIQUE:** `(user_id, day_of_week, meal_type)` — garantiza que no puede haber dos filas para el mismo usuario, día y momento del día.

**Siempre UPSERT:** Nunca se hace INSERT directo. Toda escritura usa `upsert` con `onConflict: 'user_id,day_of_week,meal_type'`. Si el slot existe lo actualiza; si no, lo crea.

**Sin historial:** Solo existe la semana actual. No hay semanas pasadas ni futuras en la BD — el menú es un estado presente, no un calendario histórico.

**Slots vacíos:** Un slot sin contenido simplemente no tiene fila en la tabla. La UI construye la rejilla de 21 slots en el cliente y consulta si existe fila para cada posición.

---

### `dishes`

Biblioteca de platos guardados por el usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, generado automáticamente |
| `user_id` | `uuid` | FK → `profiles.id` |
| `name` | `text` | Nombre del plato |
| `notes` | `text \| null` | Notas libres (ingredientes, pasos, link, etc.) |
| `created_at` | `timestamptz \| null` | Fecha de creación |

---

### `dish_tags`

Tags asociados a cada plato. Tabla de relación entre `dishes` y etiquetas libres.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, generado automáticamente |
| `dish_id` | `uuid` | FK → `dishes.id` |
| `user_id` | `uuid` | FK → `profiles.id` |
| `tag` | `text` | Texto de la etiqueta |

**`user_id` en `dish_tags`:** Aunque el `user_id` podría deducirse a través de `dish_id → dishes.user_id`, se incluye directamente para simplificar las políticas RLS — cada regla puede validar `user_id = auth.uid()` sin joins.

**Constraint UNIQUE:** `(dish_id, tag)` — un plato no puede tener el mismo tag dos veces.

**Sin tabla de tags maestra:** Los tags son strings libres, no hay una tabla `tags` centralizada. La lista de tags disponibles se deriva de todas las filas de `dish_tags` del usuario.

**Cascade:** Si se borra un `dish`, sus `dish_tags` se borran en cascada.

---

## Row Level Security (RLS)

RLS está habilitado en las cinco tablas. La política aplicada en todas es la misma:

```sql
-- Solo puedes ver y modificar tus propios datos
USING (user_id = auth.uid())
```

Esto significa que aunque dos usuarios compartan la misma instancia de Supabase, las queries del cliente nunca devuelven datos ajenos — la BD lo filtra automáticamente antes de que llegue al cliente.

---

## Triggers de creación automática

Al crear un usuario en `auth.users` se disparan dos inserciones automáticas en cadena:

```
INSERT INTO auth.users
    │
    ├─► trigger → INSERT INTO public.profiles (id = new.id)
    │
    └─► trigger → INSERT INTO public.supermarkets
                    (user_id = new.id, name = 'General', is_default = true, position = 0)
```

Esto garantiza que al terminar el registro el usuario ya tiene perfil y supermercado por defecto listos, sin que la app tenga que hacer ninguna llamada adicional.

> **Pendiente:** Añadir el trigger de creación del supermercado por defecto al SQL del schema en Supabase, y añadir la columna `is_default boolean NOT NULL DEFAULT false` a la tabla `supermarkets`. Regenerar los tipos con `yarn supabase:types` después.

---

## Tipos TypeScript

Los tipos de todas las tablas se generan automáticamente desde el esquema de Supabase:

```bash
yarn supabase:types
```

Genera `src/shared/lib/supabase/types.ts` con los tipos `Row`, `Insert` y `Update` de cada tabla, más los helpers `Tables<>`, `TablesInsert<>` y `TablesUpdate<>` para usarlos en el código de la app.
