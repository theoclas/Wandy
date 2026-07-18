import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

export function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Wandy</div>
        <nav>
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/patients">Pacientes</NavLink>
          {isAdmin && (
            <>
              <NavLink to="/professionals">Profesionales</NavLink>
              <NavLink to="/patient-types">Tipos de paciente</NavLink>
              <NavLink to="/phases">Fases Erikson</NavLink>
            </>
          )}
          {!isAdmin && <NavLink to="/phases">Fases (consulta)</NavLink>}
        </nav>
        <div className="sidebar-user">
          <div>{user?.email}</div>
          <div>{user?.role === 'ADMIN' ? 'Administrador' : 'Profesional'}</div>
          <button
            className="secondary"
            style={{ marginTop: '0.75rem', color: '#e8f0ec', borderColor: '#4a635a' }}
            onClick={logout}
          >
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
