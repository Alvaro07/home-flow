import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../model/useAuth'
import { PageLayout } from '@shared/ui/PageLayout'
import { EyeIcon, EyeOffIcon } from '@shared/ui/icons'
import { ROUTES } from '@app/router/routes'
import type { LoginCredentials } from '../api/authApi'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

interface LocationState {
  registered?: boolean
}

export const LoginForm = () => {
  const { login, isLoading, error, clearError } = useAuth()
  const location = useLocation()
  const registered = (location.state as LocationState | null)?.registered === true

  const [form, setForm] = useState({ email: '', password: '' })
  const [formErrors, setFormErrors] = useState({} as FormErrors)
  const [showPassword, setShowPassword] = useState(false)

  const validate = (): boolean => {
    const errors: FormErrors = {}

    if (!form.email) {
      errors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'El email no tiene un formato válido'
    }

    if (!form.password) {
      errors.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return

    const credentials: LoginCredentials = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    }

    await login(credentials)
  }

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <PageLayout>
      <div className="glass-card anim-card">
        {/* Logo row */}
        <div className="card-logo anim-1">
          <div className="card-logo-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="card-logo-name">Supabase Login</span>
        </div>

        {/* Heading */}
        <h1 className="card-title anim-2">
          Bienvenido<em style={{ fontStyle: 'italic' }}>.</em>
        </h1>
        <p className="card-subtitle anim-3">Inicia sesión para continuar</p>

        {/* Success notification after register */}
        {registered && (
          <div className="success-banner anim-3" role="status">
            Cuenta creada correctamente. Ya puedes iniciar sesión.
          </div>
        )}

        {/* API error */}
        {error && (
          <div className="error-banner anim-3" role="alert">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          noValidate
        >
          {/* Email */}
          <div className="field-group anim-3">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`field-input${formErrors.email ? ' is-error' : ''}`}
              value={form.email}
              onChange={handleChange('email')}
              placeholder="tu@email.com"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            {formErrors.email && (
              <span className="field-error" role="alert">
                {formErrors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="field-group anim-4">
            <label htmlFor="password" className="field-label">
              Contraseña
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`field-input${formErrors.password ? ' is-error' : ''}`}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Tu contraseña"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                onClick={() => {
                  setShowPassword((v) => !v)
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {formErrors.password && (
              <span className="field-error" role="alert">
                {formErrors.password}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="btn-primary anim-5"
            disabled={isLoading}
          >
            {isLoading && <span className="btn-spinner" aria-hidden="true" />}
            {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="form-footer">
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.REGISTER}>Regístrate</Link>
        </p>
      </div>
    </PageLayout>
  )
}
