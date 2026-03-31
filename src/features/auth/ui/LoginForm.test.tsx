import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { renderWithProviders } from '@shared/lib/test/renderWithProviders'
import { LoginForm } from './LoginForm'
import { useAuthStore } from '../model/authStore'

// URL base de Supabase para las peticiones de MSW
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://mock.supabase.co'

describe('LoginForm', () => {
  beforeEach(() => {
    // Limpiamos el estado del store antes de cada test para evitar colisiones
    useAuthStore.getState().reset()
  })

  it('renderiza el formulario con todos sus campos', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('valida que los campos no estén vacíos al enviar', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/el email es obligatorio/i)).toBeInTheDocument()
    expect(await screen.findByText(/la contraseña es obligatoria/i)).toBeInTheDocument()
  })

  it('muestra error de formato de email inválido', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/el email no tiene un formato válido/i)).toBeInTheDocument()
  })

  it('deshabilita el botón de login mientras la petición está en curso', async () => {
    const user = userEvent.setup()

    // Mockeamos la respuesta con retardo para ver el estado de carga
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({ access_token: 'fake-jwt', user: { id: '123' } })
      }),
    )

    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'correctpassword')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    // El botón cambia su texto/estado mientras isLoading es true
    expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled()
  })

  it('muestra un mensaje de error si las credenciales son incorrectas', async () => {
    const user = userEvent.setup()

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid login credentials' },
          { status: 400 },
        )
      }),
    )

    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'wrong@user.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    // El mensaje de error que configuramos en authApi mapper
    expect(await screen.findByText(/email o contraseña incorrectos/i)).toBeInTheDocument()
  })

  it('muestra error si la contraseña tiene menos de 6 caracteres', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), '123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/al menos 6 caracteres/i)).toBeInTheDocument()
  })

  it('alterna la visibilidad de la contraseña al pulsar el toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    const passwordInput = screen.getByLabelText(/contraseña/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /mostrar clave/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /ocultar clave/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('limpia errores de validación al empezar a escribir de nuevo', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    // Provocamos error
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText(/el email es obligatorio/i)).toBeInTheDocument()

    // Empezamos a corregir
    await user.type(screen.getByLabelText(/email/i), 'a')

    await waitFor(() => {
      expect(screen.queryByText(/el email es obligatorio/i)).not.toBeInTheDocument()
    })
  })
})
