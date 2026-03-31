import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../model/useAuth'
import { PageLayout } from '@shared/ui/PageLayout'
import { EyeIcon, EyeOffIcon } from '@shared/ui/icons'
import { ROUTES } from '@app/router/routes'
import type { LoginCredentials } from '../api/authApi'
import './RegisterForm.css'

interface RegisterFormState {
  email: string
  password: string
  confirmPassword: string
}

interface RegisterFormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

const PASSWORD_RULES = [
  { regex: /.{8,}/, label: '8 caracteres' },
  { regex: /[A-Z]/, label: 'mayúscula' },
  { regex: /[0-9]/, label: 'número' },
  { regex: /[^A-Za-z0-9]/, label: 'carácter especial' },
]

const getPasswordStrength = (password: string): { strength: PasswordStrength; score: number } => {
  const score = PASSWORD_RULES.filter(({ regex }) => regex.test(password)).length
  const strength: PasswordStrength =
    score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'good' : 'strong'
  return { strength, score }
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: 'Débil',
  fair: 'Aceptable',
  good: 'Buena',
  strong: 'Fuerte',
}

export const RegisterForm = () => {
  const { register, isLoading, error, clearError } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState({} as RegisterFormErrors)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { strength, score } = getPasswordStrength(form.password)

  const validate = (): boolean => {
    const errors: RegisterFormErrors = {}

    if (!form.email) {
      errors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'El email no tiene un formato válido'
    }

    if (!form.password) {
      errors.password = 'La contraseña es obligatoria'
    } else {
      const failing = PASSWORD_RULES.find(({ regex }) => !regex.test(form.password))
      if (failing) {
        errors.password = `Debe incluir al menos un ${failing.label}`
      }
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
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

    await register(credentials)
  }

  const handleChange =
    (field: keyof RegisterFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
          Crear cuenta<em style={{ fontStyle: 'italic' }}>.</em>
        </h1>
        <p className="card-subtitle anim-3">Regístrate para continuar</p>

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
                placeholder="Mín. 8 caracteres"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                onClick={() => { setShowPassword((v) => !v) }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Strength bar */}
            {form.password.length > 0 && (
              <>
                <div className="password-strength" aria-hidden="true">
                  {PASSWORD_RULES.map((_, i) => (
                    <div
                      key={i}
                      className={`password-strength-bar${i < score ? ` active-${strength}` : ''}`}
                    />
                  ))}
                </div>
                <p className="password-strength-label">{STRENGTH_LABELS[strength]}</p>
              </>
            )}

            {formErrors.password && (
              <span className="field-error" role="alert">
                {formErrors.password}
              </span>
            )}
          </div>

          {/* Confirm password */}
          <div className="field-group anim-4">
            <label htmlFor="confirmPassword" className="field-label">
              Confirmar contraseña
            </label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className={`field-input${formErrors.confirmPassword ? ' is-error' : ''}`}
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Repite tu contraseña"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                onClick={() => { setShowConfirm((v) => !v) }}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <span className="field-error" role="alert">
                {formErrors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            className="btn-primary anim-5"
            disabled={isLoading}
          >
            {isLoading && <span className="btn-spinner" aria-hidden="true" />}
            {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="form-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.LOGIN}>Inicia sesión</Link>
        </p>
      </div>
    </PageLayout>
  )
}
