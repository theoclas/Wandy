import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  type ClinicalHistoryView,
  type ScoreChangeLog,
} from '../api';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ClinicalHistoryView | null>(null);
  const [error, setError] = useState('');
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [historyCriterionId, setHistoryCriterionId] = useState<string | null>(
    null,
  );
  const [historyLabel, setHistoryLabel] = useState('');
  const [history, setHistory] = useState<ScoreChangeLog[]>([]);
  const [historyDate, setHistoryDate] = useState('');
  const [savingHistoryDate, setSavingHistoryDate] = useState(false);
  const [savingCriterionId, setSavingCriterionId] = useState<string | null>(
    null,
  );
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});

  function toDateInput(value: string) {
    return value.slice(0, 10);
  }

  async function load() {
    if (!id) return;
    const result = await api<ClinicalHistoryView>(
      `/patients/${id}/clinical-history`,
    );
    setData(result);
    setHistoryDate(toDateInput(result.historyDate));
    setActivePhaseId((prev) => {
      if (prev && result.phases.some((p) => p.id === prev)) return prev;
      return result.phases.find((p) => p.unlocked)?.id ?? result.phases[0]?.id ?? null;
    });
    const drafts: Record<string, string> = {};
    for (const phase of result.phases) {
      for (const sg of phase.subgroups) {
        for (const c of sg.criteria) {
          drafts[c.id] = String(c.score);
        }
      }
    }
    setDraftScores(drafts);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);

  async function saveHistoryDate() {
    if (!id || !historyDate) return;
    setSavingHistoryDate(true);
    setError('');
    try {
      await api(`/patients/${id}/clinical-history`, {
        method: 'PATCH',
        body: JSON.stringify({ historyDate }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSavingHistoryDate(false);
    }
  }

  async function saveCriterion(criterionScoreId: string) {
    if (!id) return;
    const raw = draftScores[criterionScoreId];
    const score = Number(raw);
    if (Number.isNaN(score) || score < 0 || score > 5) {
      setError('La calificación debe ser un número entre 0 y 5');
      return;
    }
    setSavingCriterionId(criterionScoreId);
    setError('');
    try {
      const result = await api<ClinicalHistoryView>(
        `/patients/${id}/criteria/${criterionScoreId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ score }),
        },
      );
      setData(result);
      const drafts: Record<string, string> = {};
      for (const phase of result.phases) {
        for (const sg of phase.subgroups) {
          for (const c of sg.criteria) {
            drafts[c.id] = String(c.score);
          }
        }
      }
      setDraftScores(drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSavingCriterionId(null);
    }
  }

  async function openHistory(criterionScoreId: string, label: string) {
    if (!id) return;
    setHistoryCriterionId(criterionScoreId);
    setHistoryLabel(label);
    setHistory(
      await api<ScoreChangeLog[]>(
        `/patients/${id}/criteria/${criterionScoreId}/history`,
      ),
    );
  }

  if (!data) {
    return (
      <div>
        {error ? (
          <div className="error">{error}</div>
        ) : (
          <p className="muted">Cargando…</p>
        )}
      </div>
    );
  }

  const { patient, globalScore, phases, approvalThreshold } = data;
  const activePhase = phases.find((p) => p.id === activePhaseId) ?? phases[0];
  const approvedCount = phases.filter((p) => p.approved).length;
  const progressPct =
    phases.length > 0 ? Math.round((approvedCount / phases.length) * 100) : 0;
  const genderLabel: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    OTHER: 'Otro',
    UNSPECIFIED: 'No especificado',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="muted">
            <Link to="/patients">← Pacientes</Link>
          </p>
          <h1>
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="muted">
            Doc. {patient.document} · {patient.patientType.name} ·{' '}
            {genderLabel[patient.gender] || patient.gender}
          </p>
        </div>
        <div className="score-badge">
          <span className="muted">Nota global</span>
          <strong>{globalScore.toFixed(2)}</strong>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <div className="info-grid">
          <div>
            <span className="muted">Profesional</span>
            <p>
              {patient.professional
                ? `${patient.professional.firstName} ${patient.professional.lastName}`
                : 'Sin asignar'}
            </p>
          </div>
          <div>
            <span className="muted">Ingreso al centro</span>
            <p>{toDateInput(patient.centerEntryDate)}</p>
          </div>
          <div>
            <span className="muted">Fecha HC</span>
            <div className="inline-form">
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
              />
              <button
                type="button"
                className="secondary"
                disabled={savingHistoryDate}
                onClick={() => void saveHistoryDate()}
              >
                Guardar
              </button>
            </div>
          </div>
          <div>
            <span className="muted">Progreso (promedio &gt; {approvalThreshold})</span>
            <p>
              {approvedCount}/{phases.length} fases · {progressPct}%
            </p>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="phase-tabs">
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            className={`phase-tab ${activePhase?.id === phase.id ? 'active' : ''} ${!phase.unlocked ? 'locked' : ''} ${phase.approved ? 'approved' : ''}`}
            onClick={() => setActivePhaseId(phase.id)}
          >
            <span>
              {phase.phaseTemplate.sortOrder}. {phase.phaseTemplate.name}
            </span>
            <strong>{phase.score.toFixed(2)}</strong>
            {!phase.unlocked && <em>Bloqueada</em>}
            {phase.approved && <em>Aprobada</em>}
          </button>
        ))}
      </div>

      {activePhase && (
        <div className={`panel ${!activePhase.unlocked ? 'is-locked' : ''}`}>
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2>{activePhase.phaseTemplate.name}</h2>
              {activePhase.phaseTemplate.description && (
                <p className="muted">{activePhase.phaseTemplate.description}</p>
              )}
            </div>
            <div className="score-badge compact">
              <span className="muted">Promedio fase</span>
              <strong>{activePhase.score.toFixed(2)}</strong>
            </div>
          </div>

          {!activePhase.unlocked && (
            <div className="warn-banner">
              Esta fase está bloqueada. Aprueba la fase anterior con promedio
              &gt; {approvalThreshold}.
            </div>
          )}

          {activePhase.subgroups.map((sg) => (
            <section
              key={sg.id}
              className={`subgroup-block ${!sg.unlocked ? 'is-locked' : ''}`}
            >
              {!sg.subgroupTemplate.hideInUi && (
                <div className="subgroup-header">
                  <div>
                    <h3>{sg.subgroupTemplate.name}</h3>
                    {sg.subgroupTemplate.purpose && (
                      <p className="muted">{sg.subgroupTemplate.purpose}</p>
                    )}
                  </div>
                  <div className="subgroup-meta">
                    <strong>{sg.score.toFixed(2)}</strong>
                    {sg.approved ? (
                      <span className="pill ok">Aprobado</span>
                    ) : (
                      <span className="pill">En curso</span>
                    )}
                    {!sg.unlocked && <span className="pill warn">Bloqueado</span>}
                  </div>
                </div>
              )}

              <div className="criteria-list">
                {sg.criteria.map((c) => {
                  const editable = activePhase.unlocked && sg.unlocked;
                  return (
                    <div key={c.id} className="criterion-row">
                      <div className="criterion-label">
                        <span className="muted">
                          {c.criterionTemplate.sortOrder}.
                        </span>{' '}
                        {c.criterionTemplate.label}
                      </div>
                      <div className="criterion-actions">
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={0.1}
                          disabled={!editable}
                          value={draftScores[c.id] ?? String(c.score)}
                          onChange={(e) =>
                            setDraftScores((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          disabled={!editable || savingCriterionId === c.id}
                          onClick={() => void saveCriterion(c.id)}
                        >
                          {savingCriterionId === c.id ? '…' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() =>
                            void openHistory(c.id, c.criterionTemplate.label)
                          }
                        >
                          Historial
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {historyCriterionId && (
        <div className="modal-backdrop" onClick={() => setHistoryCriterionId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="page-header">
              <div>
                <h2>Historial de calificación</h2>
                <p className="muted">{historyLabel}</p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => setHistoryCriterionId(null)}
              >
                Cerrar
              </button>
            </div>
            {history.length === 0 ? (
              <p className="muted">Sin cambios registrados.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Anterior</th>
                    <th>Nueva</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td>{new Date(row.changedAt).toLocaleString()}</td>
                      <td>{row.previousScore.toFixed(2)}</td>
                      <td>{row.newScore.toFixed(2)}</td>
                      <td>{row.changedBy.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
