import { useEffect, useState } from 'react';
import { api, type PhaseTemplate } from '../api';

export function PhasesPage() {
  const [phases, setPhases] = useState<PhaseTemplate[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<PhaseTemplate[]>('/phase-templates')
      .then(setPhases)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Fases del tratamiento</h1>
          <p className="muted">
            Destellos → Iluminación → Resplandor → Esplendor (catálogo de
            plantillas)
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}

      <div className="phase-catalog">
        {phases.map((phase) => (
          <article key={phase.id} className="panel">
            <div className="page-header" style={{ marginBottom: '0.75rem' }}>
              <div>
                <h2>
                  {phase.sortOrder}. {phase.name}
                </h2>
                {phase.description && (
                  <p className="muted">{phase.description}</p>
                )}
              </div>
              <span className="pill">
                {phase.unlockMode === 'SEQUENTIAL'
                  ? 'Desbloqueo sucesivo'
                  : 'Subgrupos abiertos'}
              </span>
            </div>

            {phase.subgroups.map((sg) => (
              <section key={sg.id} className="subgroup-block">
                {!sg.hideInUi && <h3>{sg.name}</h3>}
                {sg.purpose && <p className="muted">{sg.purpose}</p>}
                <ol className="criteria-catalog">
                  {sg.criteria.map((c) => (
                    <li key={c.id}>{c.label}</li>
                  ))}
                </ol>
              </section>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
