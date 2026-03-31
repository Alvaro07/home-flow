# Supabase React Login

Aplicación de autenticación completa construida con React, TypeScript y Supabase. Incluye login, registro, rutas protegidas y gestión de sesión en tiempo real.

**[Ver demo en Vercel →](https://supabase-react-login-git-develop-lvaro-gonzlezs-projects.vercel.app/login)**

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Primeros pasos](#primeros-pasos)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Buenas prácticas aplicadas](#buenas-prácticas-aplicadas)
- [Flujo de autenticación](#flujo-de-autenticación)

---

## Stack tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| UI | React | 18 |
| Lenguaje | TypeScript | ~5.9 |
| Build | Vite | ^8 |
| Backend / Auth | Supabase JS | ^2 |
| Estado global | Zustand | ^5 |
| Servidor de datos | TanStack Query | ^5 |
| Componentes UI | PrimeReact + PrimeFlex | ^10 / ^4 |
| Enrutamiento | React Router DOM | ^7 |
| Validación de esquemas | Zod | ^4 |
| Testing | Vitest + Testing Library | ^4 |
| Mocks de red | MSW (Mock Service Worker) | ^2 |
| Linting | ESLint + typescript-eslint | ^10 / ^8 |
| Formato | Prettier | ^3 |
| Git hooks | Husky + lint-staged | ^9 / ^16 |
| Commits | commitlint (Conventional Commits) | ^20 |

---

## Arquitectura

El proyecto sigue **Feature-Sliced Design (FSD)**, una metodología de arquitectura frontend que organiza el código por capas de responsabilidad con dependencias unidireccionales: las capas inferiores no conocen a las superiores.

```
app → pages → widgets → features → entities → shared
```

| Capa | Responsabilidad |
|---|---|
| `app` | Proveedores globales, router, estilos base |
| `pages` | Composición de páginas — montan widgets y features |
| `widgets` | Bloques UI reutilizables (ej: `ProtectedRoute`) |
| `features` | Lógica de negocio completa por dominio (ej: `auth`) |
| `shared` | Código sin dominio: cliente Supabase, config de env, utilidades de test |

Dentro de cada feature, el código se divide en tres segmentos:

- **`api/`** — comunicación con servicios externos
- **`model/`** — estado (store) y hooks de lógica
- **`ui/`** — componentes React

### Path aliases

Configurados en `vite.config.ts` y `tsconfig.json` para evitar rutas relativas profundas:

```ts
@app      → src/app
@pages    → src/pages
@features → src/features
@widgets  → src/widgets
@shared   → src/shared
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── providers/
│   │   └── AppProviders.tsx      # QueryClient + PrimeReact + SessionProvider
│   ├── router/
│   │   ├── AppRouter.tsx         # Definición de rutas
│   │   └── routes.ts             # Constantes de rutas tipadas
│   └── styles/
│       └── index.css             # Estilos globales
│
├── pages/
│   ├── LoginPage/
│   ├── RegisterPage/
│   ├── DashboardPage/
│   └── NotFoundPage/
│
├── widgets/
│   └── ProtectedRoute/           # HOC que guarda rutas privadas
│
├── features/
│   └── auth/
│       ├── api/
│       │   └── authApi.ts        # signIn, signOut, signUp, getSession, onAuthStateChange
│       ├── model/
│       │   ├── authStore.ts      # Store Zustand con selectores
│       │   ├── useAuth.ts        # Hook de acciones (login, logout, register)
│       │   └── useSession.ts     # Hook de inicialización y listener de sesión
│       └── ui/
│           ├── LoginForm.tsx
│           └── RegisterForm.tsx
│
└── shared/
    ├── config/
    │   └── env.ts                # Variables de entorno validadas con Zod
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts         # Cliente Supabase tipado con Database
    │   │   └── types.ts          # Tipos generados por Supabase CLI
    │   ├── queryClient.ts        # Configuración de TanStack Query
    │   └── test/
    │       ├── setup.ts          # Setup global de Vitest
    │       ├── server.ts         # Servidor MSW para tests
    │       └── renderWithProviders.tsx
    └── ui/
        ├── PageLayout.tsx
        └── icons.tsx
```

---

## Primeros pasos

### Requisitos previos

- Node.js >= 18
- npm >= 9
- Una cuenta y proyecto en [Supabase](https://supabase.com)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/supabase-react-login.git
cd supabase-react-login

# 2. Instalar dependencias
npm install

# 3. Configurar las variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Arrancar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Variables de entorno

Crea un fichero `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

> Ambas variables se obtienen desde **Project Settings → API** en el dashboard de Supabase.

Las variables se validan en tiempo de arranque mediante un esquema Zod (`src/shared/config/env.ts`). Si alguna falta, la aplicación falla con un error claro antes de renderizar nada.

### Entorno de test

Para los tests, crea un `.env.test` con valores de prueba (no hace falta que sean reales, MSW intercepta las peticiones de red):

```env
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=test-anon-key
```

### Generación de tipos desde Supabase

```bash
npm run supabase:types
```

Genera automáticamente `src/shared/lib/supabase/types.ts` con los tipos de las tablas de tu proyecto, dando tipado completo al cliente de Supabase.

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (TypeCheck + Vite) |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run typecheck` | Comprobación de tipos sin emitir ficheros |
| `npm run test` | Ejecuta tests en modo watch |
| `npm run test:run` | Ejecuta tests una sola vez (CI) |
| `npm run test:ui` | Abre la UI de Vitest en el navegador |
| `npm run test:coverage` | Genera informe de cobertura |
| `npm run supabase:types` | Genera tipos TypeScript desde el esquema de Supabase |

---

## Testing

### Herramientas

- **Vitest** — test runner compatible con Vite, API compatible con Jest
- **Testing Library** — tests centrados en el comportamiento del usuario
- **MSW** — intercepta peticiones de red a nivel de Service Worker, sin mocks frágiles
- **happy-dom** — entorno de DOM ligero y rápido

### Umbrales de cobertura

Configurados en `vite.config.ts`. El build de CI falla si se baja de:

| Métrica | Mínimo |
|---|---|
| Líneas | 70% |
| Funciones | 70% |
| Ramas | 60% |
| Sentencias | 70% |

### Ejecutar tests

```bash
# Una sola pasada
npm run test:run

# Modo watch durante desarrollo
npm run test

# Con informe de cobertura HTML
npm run test:coverage
```

---

## Buenas prácticas aplicadas

### Result type — sin excepciones en la capa de API

Todos los métodos de `authApi` devuelven un tipo discriminado en lugar de lanzar excepciones. Esto hace que los errores sean parte del contrato y obliga al consumidor a manejarlos:

```ts
type AuthResult<T> = { data: T; error: null } | { data: null; error: AuthError }

const result = await authApi.signIn(credentials)
if (result.error) {
  // el compilador sabe que result.data es null aquí
  setError(result.error.message)
  return
}
// el compilador sabe que result.data es T aquí
```

### Selectores Zustand — sin re-renders innecesarios

Se definen selectores como funciones separadas para que los componentes solo se re-rendericen cuando cambia exactamente la parte del estado que consumen:

```ts
export const selectIsAuthenticated = (state: AuthState) => !!state.session
export const selectIsLoading       = (state: AuthState) => state.isLoading

// En el componente:
const isAuthenticated = useAuthStore(selectIsAuthenticated)
```

### Validación de entorno en arranque

Las variables de entorno se validan con Zod antes de que se monte la aplicación. Un error de configuración falla rápido y de forma explícita en lugar de producir un comportamiento inesperado en tiempo de ejecución.

### Suscripción a sesión con cleanup

`useSession` inicializa la sesión y suscribe un listener a los eventos de Supabase (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`). La suscripción se cancela en el cleanup del efecto para evitar memory leaks:

```ts
const subscription = authApi.onAuthStateChange((session) => {
  setSession(session)
})

return () => subscription.unsubscribe()
```

### Mapeo de errores de Supabase

Los errores en inglés de la API de Supabase se traducen y normalizan en `authApi.ts` antes de llegar a la UI, manteniendo los mensajes de usuario en español y el código de la API aislado de la capa de presentación.

### Commits convencionales

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) con `commitlint` y `husky`. Cada commit se valida automáticamente antes de ser aceptado:

```
feat: añadir formulario de registro
fix: corregir redirección tras login
test: añadir tests de authStore
```

### Lint y formato automáticos en pre-commit

`lint-staged` ejecuta ESLint y Prettier únicamente sobre los ficheros modificados en cada commit, manteniendo el código limpio sin penalizar el tiempo de espera.

---

## Flujo de autenticación

```
Arranque de la app
       │
       ▼
AppProviders monta SessionProvider
       │
       ▼
useSession() — getSession() desde localStorage
       │
       ├─ Con sesión ──► setSession(session) ──► isLoading = false
       │
       └─ Sin sesión ─► reset() ──────────────► isLoading = false
                                                        │
                                              Listener onAuthStateChange activo
                                              durante toda la vida de la app


Usuario accede a /dashboard
       │
       ▼
ProtectedRoute comprueba isLoading + isAuthenticated
       │
       ├─ isLoading = true  ──► renderiza null (sin flash de login)
       ├─ No autenticado    ──► <Navigate to="/login" />
       └─ Autenticado       ──► renderiza DashboardPage


Login exitoso
       │
       ▼
authApi.signIn() ──► Supabase emite SIGNED_IN
       │
       ▼
onAuthStateChange dispara ──► setSession(session)
       │
       ▼
ProtectedRoute detecta isAuthenticated = true ──► acceso permitido
```
