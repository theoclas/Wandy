import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type DashboardStats } from '../api';
import { useAuth } from '../auth';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DashboardStats>('/dashboard')
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  const greeting = user?.professional
    ? `${user.professional.firstName} ${user.professional.lastName}`
    : user?.email;

  if (loading) {
    return <p className="muted">Cargando dashboard…</p>;
  }

  if (error || !stats) {
    return <div className="error">{error || 'No se pudieron cargar las estadísticas'}</div>;
  }

  const maxPhasePatients = Math.max(
    ...stats.phases.map((p) => p.completedCount + p.pendingCount),
    1,
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Resumen clínico · {greeting}</p>
        </div>
        <Link to="/patients">
          <button type="button">Gestionar pacientes</button>
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Pacientes</span>
          <strong className="stat-value">{stats.totals.patients}</strong>
          <span className="muted">
            {stats.scores.patientsWithEvaluations} con evaluaciones
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Calificación promedio</span>
          <strong className="stat-value accent">
            {stats.scores.averageGlobal !== null
              ? stats.scores.averageGlobal.toFixed(1)
              : '—'}
          </strong>
          <span className="muted">sobre fases evaluadas (1–5)</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Evaluaciones</span>
          <strong className="stat-value">{stats.totals.evaluations}</strong>
          <span className="muted">
            {stats.scores.fullyCompleted} historias completas
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Profesionales</span>
          <strong className="stat-value">{stats.totals.professionals}</strong>
          <span className="muted">
            {stats.totals.phaseTemplates} fases · {stats.totals.patientTypes}{' '}
            tipos
          </span>
        </div>
      </div>

      <div className="dash-columns">
        <div className="panel">
          <h2>Fases eriksonianas</h2>
          <p className="muted" style={{ marginBottom: '1rem' }}>
            Pacientes que ya completaron cada fase frente a los pendientes
          </p>
          <div className="phase-bars">
            {stats.phases.map((phase) => {
              const total = phase.completedCount + phase.pendingCount;
              const pct =
                total > 0 ? Math.round((phase.completedCount / total) * 100) : 0;
              const widthPct = Math.round((total / maxPhasePatients) * 100);
              return (
                <div key={phase.id} className="phase-bar-row">
                  <div className="phase-bar-label">
                    <strong>
                      {phase.sortOrder}. {phase.name}
                    </strong>
                    <span className="muted">{phase.crisis}</span>
                  </div>
                  <div className="phase-bar-track" style={{ width: `${Math.max(widthPct, 40)}%` }}>
                    <div
                      className="phase-bar-fill"
                      style={{ width: `${pct}%` }}
                      title={`${phase.completedCount} completadas`}
                    />
                  </div>
                  <div className="phase-bar-meta">
                    <span className="badge ok">{phase.completedCount} hechas</span>
                    <span className="badge">{phase.pendingCount} pend.</span>
                    {phase.averageScore !== null && (
                      <span className="badge score">
                        avg {phase.averageScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h2>Por tipo de paciente</h2>
          {stats.byPatientType.length === 0 ? (
            <p className="muted">Aún no hay pacientes registrados.</p>
          ) : (
            <ul className="type-list">
              {stats.byPatientType.map((t) => (
                <li key={t.name}>
                  <span>{t.name}</span>
                  <strong>{t.count}</strong>
                </li>
              ))}
            </ul>
          )}
          <div className="dash-summary">
            <div>
              <span className="muted">Sin evaluar</span>
              <strong>{stats.scores.patientsWithoutEvaluations}</strong>
            </div>
            <div>
              <span className="muted">En progreso</span>
              <strong>
                {stats.scores.patientsWithEvaluations -
                  stats.scores.fullyCompleted}
              </strong>
            </div>
            <div>
              <span className="muted">Completos</span>
              <strong>{stats.scores.fullyCompleted}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="page-header" style={{ marginBottom: '0.75rem' }}>
          <h2>Pacientes y fase actual</h2>
        </div>
        {stats.patients.length === 0 ? (
          <p className="muted">
            No hay pacientes.{' '}
            <Link to="/patients">Crear el primero</Link>
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Tipo</th>
                  <th>Progreso</th>
                  <th>Fase actual</th>
                  <th>Última completada</th>
                  <th>Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.patients.map((p) => {
                  const progressPct =
                    p.totalPhases > 0
                      ? Math.round((p.completedPhases / p.totalPhases) * 100)
                      : 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>
                          {p.firstName} {p.lastName}
                        </strong>
                        <div className="muted">{p.document}</div>
                      </td>
                      <td>{p.patientType}</td>
                      <td>
                        <div className="mini-progress">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="muted">
                          {p.completedPhases}/{p.totalPhases} ({progressPct}%)
                        </span>
                      </td>
                      <td>
                        {p.currentPhase ? (
                          <>
                            <span
                              className={`badge ${p.currentPhase.status === 'COMPLETED' ? 'ok' : ''}`}
                            >
                              {p.currentPhase.status === 'PENDING'
                                ? 'Pendiente'
                                : 'Completa'}
                            </span>
                            <div>
                              {p.currentPhase.sortOrder}. {p.currentPhase.name}
                            </div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {p.lastCompletedPhase
                          ? `${p.lastCompletedPhase.sortOrder}. ${p.lastCompletedPhase.name} (${p.lastCompletedPhase.score.toFixed(1)})`
                          : 'Ninguna'}
                      </td>
                      <td>
                        {p.globalScore !== null ? (
                          <span className="score-badge compact">
                            {p.globalScore.toFixed(1)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <Link to={`/patients/${p.id}`}>
                          <button type="button" className="secondary">
                            Ver
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
