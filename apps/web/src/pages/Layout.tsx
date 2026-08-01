import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

export function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="topbar-menu-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="topbar-brand">
          <img src="/icon-192.png" alt="" className="topbar-brand-mark" />
          <strong>DESTELLOS</strong>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            src="/icon-192.png"
            alt="Corporación Destellos"
            className="sidebar-brand-mark"
          />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Corporación</span>
            <strong className="sidebar-brand-title">DESTELLOS</strong>
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Cerrar menú"
            onClick={closeMenu}
          >
            ×
          </button>
        </div>
        <nav>
          <NavLink to="/" end onClick={closeMenu}>
            Inicio
          </NavLink>
          <NavLink to="/patients" onClick={closeMenu}>
            Pacientes
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/professionals" onClick={closeMenu}>
                Profesionales
              </NavLink>
              <NavLink to="/patient-types" onClick={closeMenu}>
                Tipos de paciente
              </NavLink>
              <NavLink to="/phases" onClick={closeMenu}>
                Fases / pesos
              </NavLink>
            </>
          )}
          {!isAdmin && (
            <NavLink to="/phases" onClick={closeMenu}>
              Fases (consulta)
            </NavLink>
          )}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-email">{user?.email}</div>
          <div className="sidebar-user-role">
            {user?.role === 'ADMIN' ? 'Administrador' : 'Profesional'}
          </div>
          <button type="button" className="sidebar-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
