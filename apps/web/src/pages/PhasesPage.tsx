import { FormEvent, useEffect, useState } from 'react';
import { api, type PhaseTemplate } from '../api';
import { useAuth } from '../auth';

export function PhasesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [phases, setPhases] = useState<PhaseTemplate[]>([]);
  const [error, setError] = useState('');
  const [newPhase, setNewPhase] = useState({
    sortOrder: 9,
    name: '',
    crisis: '',
    description: '',
  });
  const [itemLabel, setItemLabel] = useState<Record<string, string>>({});

  async function load() {
    setPhases(await api<PhaseTemplate[]>('/phase-templates'));
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function createPhase(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/phase-templates', {
        method: 'POST',
        body: JSON.stringify(newPhase),
      });
      setNewPhase({
        sortOrder: newPhase.sortOrder + 1,
        name: '',
        crisis: '',
        description: '',
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function addItem(phaseId: string) {
    const label = itemLabel[phaseId]?.trim();
    if (!label) return;
    const phase = phases.find((p) => p.id === phaseId);
    await api(`/phase-templates/${phaseId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        sortOrder: (phase?.items.length || 0) + 1,
        label,
      }),
    });
    setItemLabel({ ...itemLabel, [phaseId]: '' });
    await load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Fases eriksonianas</h1>
          <p className="muted">
            Plantillas de evaluación basadas en la teoría de Erik Erikson
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}

      {isAdmin && (
        <div className="panel">
          <h2>Agregar fase</h2>
          <form onSubmit={createPhase} className="form-grid">
            <div className="field">
              <label>Orden</label>
              <input
                type="number"
                min={1}
                value={newPhase.sortOrder}
                onChange={(e) =>
                  setNewPhase({
                    ...newPhase,
                    sortOrder: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="field">
              <label>Nombre</label>
              <input
                value={newPhase.name}
                onChange={(e) =>
                  setNewPhase({ ...newPhase, name: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label>Crisis</label>
              <input
                value={newPhase.crisis}
                onChange={(e) =>
                  setNewPhase({ ...newPhase, crisis: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label>Descripción</label>
              <input
                value={newPhase.description}
                onChange={(e) =>
                  setNewPhase({ ...newPhase, description: e.target.value })
                }
              />
            </div>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button type="submit">Crear fase</button>
            </div>
          </form>
        </div>
      )}

      <div className="phase-list">
        {phases.map((phase) => (
          <div key={phase.id} className="phase-row done">
            <div className="phase-meta">
              <div>
                <strong>
                  {phase.sortOrder}. {phase.name}
                </strong>
                <div className="muted">{phase.crisis}</div>
              </div>
              <span className={`badge ${phase.active ? 'ok' : ''}`}>
                {phase.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            {phase.description && <p className="muted">{phase.description}</p>}
            <ul>
              {phase.items.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
            {isAdmin && (
              <div className="actions">
                <input
                  placeholder="Nuevo ítem…"
                  value={itemLabel[phase.id] || ''}
                  onChange={(e) =>
                    setItemLabel({ ...itemLabel, [phase.id]: e.target.value })
                  }
                  style={{ maxWidth: 280 }}
                />
                <button type="button" onClick={() => addItem(phase.id)}>
                  Agregar ítem
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
