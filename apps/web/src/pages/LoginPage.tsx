import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-card" aria-label="Iniciar sesión">
          <div className="login-card-brand">
            <img
              src="/logo-destellos.png"
              alt="Corporación Destellos"
              className="login-card-logo"
            />
            <p className="login-card-tagline">
              Psicología especializada en adicciones
            </p>
          </div>

          {error && <div className="error">{error}</div>}
          {info && <div className="login-info">{info}</div>}

          <form onSubmit={onSubmit} className="login-form">
            <label className="login-input">
              <span className="login-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                  <path
                    d="M5.5 18.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="Usuario o correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="login-input">
              <span className="login-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 10V8a4 4 0 0 1 8 0v2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-eye"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M3 3l18 18M10.6 10.6A2.5 2.5 0 0 0 13.4 13.4M9.9 5.3A9.5 9.5 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.5M6.2 6.2C4.5 7.5 3.4 9.1 3 12c1 2.5 5 7 9 7 1.3 0 2.6-.3 3.8-.9"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                )}
              </button>
            </label>

            <button type="submit" disabled={submitting} className="login-submit">
              {submitting ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>

          <button
            type="button"
            className="login-forgot"
            onClick={() =>
              setInfo('Para restablecer tu contraseña, contacta al administrador del sistema.')
            }
          >
            ¿Olvidaste tu contraseña?
          </button>

          <p className="login-footer-note">
            <span className="login-footer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path
                  d="M4 14c2-1 3.5-1 4.5 0S11 16 12 16s2-.5 3.5-2 2.5-1 4.5 0"
                  stroke="#1e4dd8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M12 8.2l1.1 2.1 2.3.3-1.7 1.6.4 2.3L12 13.4l-2.1 1.1.4-2.3-1.7-1.6 2.3-.3L12 8.2Z"
                  fill="#1e4dd8"
                />
              </svg>
            </span>
            <span>
              Cada paso hacia el cambio es un{' '}
              <strong>destello</strong> de esperanza.
            </span>
          </p>
        </section>

        <section
          className="login-hero"
          aria-label="Corporación Destellos"
          role="img"
        />
      </div>
    </div>
  );
}
