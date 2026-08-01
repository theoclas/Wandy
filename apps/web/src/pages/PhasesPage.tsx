import { useEffect, useMemo, useState } from 'react';
import { api, type PhaseTemplate } from '../api';
import { useAuth } from '../auth';

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function sumPct(values: number[]) {
  return round2(values.reduce((a, b) => a + b, 0));
}

function isHundred(sum: number) {
  return Math.abs(sum - 100) <= 0.01;
}

export function PhasesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [phases, setPhases] = useState<PhaseTemplate[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function hydrate(list: PhaseTemplate[]) {
    setPhases(list);
    const next: Record<string, string> = {};
    for (const phase of list) {
      next[`phase:${phase.id}`] = String(phase.weightPct);
      for (const sg of phase.subgroups) {
        next[`sg:${sg.id}`] = String(sg.weightPct);
        for (const c of sg.criteria) {
          next[`c:${c.id}`] = String(c.weightPct);
        }
      }
    }
    setDrafts(next);
  }

  useEffect(() => {
    api<PhaseTemplate[]>('/phase-templates')
      .then(hydrate)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, []);

  function setDraft(key: string, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
    setOkMsg('');
  }

  function num(key: string) {
    const raw = drafts[key];
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  const validation = useMemo(() => {
    const problems: string[] = [];
    if (!phases.length) return problems;

    const phaseWeights = phases.map((p) => num(`phase:${p.id}`));
    if (phaseWeights.some((w) => Number.isNaN(w) || w < 0 || w > 100)) {
      problems.push('Los pesos de fase deben ser números entre 0 y 100');
    } else {
      const total = sumPct(phaseWeights);
      if (!isHundred(total)) {
        problems.push(`Pesos de fases suman ${total}% (deben ser 100%)`);
      }
    }

    for (const phase of phases) {
      const sgWeights = phase.subgroups.map((sg) => num(`sg:${sg.id}`));
      if (sgWeights.some((w) => Number.isNaN(w) || w < 0 || w > 100)) {
        problems.push(
          `Pesos inválidos en subgrupos de "${phase.name}" (0–100)`,
        );
      } else {
        const total = sumPct(sgWeights);
        if (!isHundred(total)) {
          problems.push(
            `Subgrupos de "${phase.name}" suman ${total}% (deben ser 100%)`,
          );
        }
      }

      for (const sg of phase.subgroups) {
        const cWeights = sg.criteria.map((c) => num(`c:${c.id}`));
        if (cWeights.some((w) => Number.isNaN(w) || w < 0 || w > 100)) {
          problems.push(`Pesos inválidos en criterios de "${sg.name}"`);
        } else {
          const total = sumPct(cWeights);
          if (!isHundred(total)) {
            problems.push(
              `Criterios de "${sg.name}" suman ${total}% (deben ser 100%)`,
            );
          }
        }
      }
    }

    return problems;
  }, [phases, drafts]);

  const phasesTotal = sumPct(phases.map((p) => num(`phase:${p.id}`) || 0));

  async function saveWeights() {
    if (!isAdmin) return;
    if (validation.length) {
      setError(validation[0]);
      return;
    }
    setSaving(true);
    setError('');
    setOkMsg('');
    try {
      const body = {
        phases: phases.map((p) => ({
          id: p.id,
          weightPct: round2(num(`phase:${p.id}`)),
        })),
        subgroups: phases.flatMap((p) =>
          p.subgroups.map((sg) => ({
            id: sg.id,
            weightPct: round2(num(`sg:${sg.id}`)),
          })),
        ),
        criteria: phases.flatMap((p) =>
          p.subgroups.flatMap((sg) =>
            sg.criteria.map((c) => ({
              id: c.id,
              weightPct: round2(num(`c:${c.id}`)),
            })),
          ),
        ),
      };
      const result = await api<PhaseTemplate[]>('/phase-templates/weights', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      hydrate(result);
      setOkMsg('Pesos guardados correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isAdmin ? 'Fases / pesos' : 'Fases del tratamiento'}</h1>
          <p className="muted">
            {isAdmin
              ? 'Asigna el porcentaje de valor en cada nivel. Cada grupo hermano debe sumar 100%.'
              : 'Catálogo Destellos → Iluminación → Resplandor → Esplendor'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            disabled={saving || validation.length > 0}
            onClick={() => void saveWeights()}
          >
            {saving ? 'Guardando…' : 'Guardar pesos'}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {okMsg && <div className="login-info">{okMsg}</div>}
      {isAdmin && validation.length > 0 && (
        <div className="warn-banner">
          {validation.slice(0, 4).map((msg) => (
            <div key={msg}>{msg}</div>
          ))}
          {validation.length > 4 && (
            <div className="muted">…y {validation.length - 4} más</div>
          )}
        </div>
      )}

      {isAdmin && (
        <section className="panel weight-panel">
          <div className="page-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <h2>Peso de cada fase (nota global)</h2>
              <p className="muted">
                Define cuánto aporta cada fase a la nota global del paciente.
              </p>
            </div>
            <span className={`pill ${isHundred(phasesTotal) ? 'ok' : 'warn'}`}>
              Total {Number.isFinite(phasesTotal) ? phasesTotal.toFixed(2) : '—'}%
            </span>
          </div>
          <div className="weight-list">
            {phases.map((phase) => (
              <label key={phase.id} className="weight-row">
                <span>
                  {phase.sortOrder}. {phase.name}
                </span>
                <span className="weight-input">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={drafts[`phase:${phase.id}`] ?? ''}
                    onChange={(e) =>
                      setDraft(`phase:${phase.id}`, e.target.value)
                    }
                  />
                  <em>%</em>
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="phase-catalog">
        {phases.map((phase) => {
          const sgTotal = sumPct(
            phase.subgroups.map((sg) => num(`sg:${sg.id}`) || 0),
          );
          return (
            <article key={phase.id} className="panel">
              <div className="page-header" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <h2>
                    {phase.sortOrder}. {phase.name}
                    {isAdmin && (
                      <span className="muted" style={{ marginLeft: '0.5rem' }}>
                        ({phase.weightPct}% global)
                      </span>
                    )}
                  </h2>
                  {phase.description && (
                    <p className="muted">{phase.description}</p>
                  )}
                </div>
                <div className="actions">
                  <span className="pill">
                    {phase.unlockMode === 'SEQUENTIAL'
                      ? 'Desbloqueo sucesivo'
                      : 'Subgrupos abiertos'}
                  </span>
                  {isAdmin && (
                    <span className={`pill ${isHundred(sgTotal) ? 'ok' : 'warn'}`}>
                      Subgrupos {sgTotal.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              {phase.subgroups.map((sg) => {
                const cTotal = sumPct(
                  sg.criteria.map((c) => num(`c:${c.id}`) || 0),
                );
                return (
                  <section key={sg.id} className="subgroup-block">
                    <div className="subgroup-header">
                      <div>
                        {!sg.hideInUi && <h3>{sg.name}</h3>}
                        {sg.purpose && <p className="muted">{sg.purpose}</p>}
                      </div>
                      {isAdmin && (
                        <div className="weight-input compact">
                          <span className="muted">Peso en fase</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={drafts[`sg:${sg.id}`] ?? ''}
                            onChange={(e) =>
                              setDraft(`sg:${sg.id}`, e.target.value)
                            }
                          />
                          <em>%</em>
                          <span
                            className={`pill ${isHundred(cTotal) ? 'ok' : 'warn'}`}
                          >
                            Crit. {cTotal.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {isAdmin ? (
                      <div className="weight-list">
                        {sg.criteria.map((c) => (
                          <label key={c.id} className="weight-row">
                            <span>
                              {c.sortOrder}. {c.label}
                            </span>
                            <span className="weight-input">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                value={drafts[`c:${c.id}`] ?? ''}
                                onChange={(e) =>
                                  setDraft(`c:${c.id}`, e.target.value)
                                }
                              />
                              <em>%</em>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <ol className="criteria-catalog">
                        {sg.criteria.map((c) => (
                          <li key={c.id}>{c.label}</li>
                        ))}
                      </ol>
                    )}
                  </section>
                );
              })}
            </article>
          );
        })}
      </div>
    </div>
  );
}
