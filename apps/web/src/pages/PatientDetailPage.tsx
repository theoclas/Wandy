import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  type ClinicalHistoryView,
  type PhaseVersion,
} from '../api';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ClinicalHistoryView | null>(null);
  const [error, setError] = useState('');
  const [evaluatingPhaseId, setEvaluatingPhaseId] = useState<string | null>(
    null,
  );
  const [historyPhaseId, setHistoryPhaseId] = useState<string | null>(null);
  const [history, setHistory] = useState<PhaseVersion[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [clarificationNote, setClarificationNote] = useState('');
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [historyDate, setHistoryDate] = useState('');
  const [savingHistoryDate, setSavingHistoryDate] = useState(false);

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
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);

  function openEvaluate(phaseId: string) {
    const phase = data?.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    const initial: Record<string, number> = {};
    for (const item of phase.phaseTemplate.items) {
      const prev = phase.currentVersion?.itemScores.find(
        (s) => s.phaseItemTemplateId === item.id,
      );
      initial[item.id] = prev?.score ?? 3;
    }
    setScores(initial);
    setNotes(phase.currentVersion?.notes || '');
    setClarificationNote('');
    setEvaluationDate(
      phase.currentVersion
        ? toDateInput(phase.currentVersion.evaluationDate)
        : new Date().toISOString().slice(0, 10),
    );
    setEvaluatingPhaseId(phaseId);
  }

  async function openHistory(phaseId: string) {
    if (!id) return;
    setHistoryPhaseId(phaseId);
    setHistory(
      await api<PhaseVersion[]>(`/patients/${id}/phases/${phaseId}/versions`),
    );
  }

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

  async function submitEvaluation(e: FormEvent) {
    e.preventDefault();
    if (!id || !evaluatingPhaseId || !data) return;
    setError('');
    const phase = data.phases.find((p) => p.id === evaluatingPhaseId);
    const isEdit = Boolean(phase?.currentVersion);
    try {
      await api(`/patients/${id}/phases/${evaluatingPhaseId}/versions`, {
        method: 'POST',
        body: JSON.stringify({
          itemScores: Object.entries(scores).map(
            ([phaseItemTemplateId, score]) => ({
              phaseItemTemplateId,
              score: Number(score),
            }),
          ),
          evaluationDate,
          notes: notes || undefined,
          clarificationNote: isEdit ? clarificationNote : undefined,
        }),
      });
      setEvaluatingPhaseId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  if (!data) {
    return (
      <div>
        {error ? <div className="error">{error}</div> : <p className="muted">Cargando…</p>}
      </div>
    );
  }

  const { patient, globalScore, phases } = data;
  const evaluating = phases.find((p) => p.id === evaluatingPhaseId);
  const completedCount = phases.filter((p) => p.currentVersion).length;
  const pendingCount = phases.length - completedCount;
  const progressPct =
    phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;
  const nextPhase = phases.find((p) => !p.currentVersion);
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
            Doc. {patient.document} · {patient.patientType.name}
          </p>
        </div>
        <div className="score-badge" title="Promedio de fases evaluadas">
          {globalScore !== null ? globalScore.toFixed(1) : '—'}
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>/ 5</span>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stat-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <span className="stat-label">Progreso</span>
          <strong className="stat-value">{progressPct}%</strong>
          <div className="mini-progress" style={{ maxWidth: '100%', marginTop: 4 }}>
            <div className="mini-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="muted">
            {completedCount} de {phases.length} fases
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completadas</span>
          <strong className="stat-value">{completedCount}</strong>
          <span className="muted">{pendingCount} pendientes</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Fase actual</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            {nextPhase
              ? `${nextPhase.phaseTemplate.sortOrder}. ${nextPhase.phaseTemplate.name}`
              : completedCount > 0
                ? 'Todas completadas'
                : 'Sin iniciar'}
          </strong>
          <span className="muted">
            {nextPhase ? 'Siguiente a evaluar' : 'Historia al día'}
          </span>
        </div>
      </div>

      <div className="panel">
        <h2>Historia clínica</h2>
        <div className="form-grid">
          <div className="field">
            <label>Fecha de la historia</label>
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
            />
          </div>
          <div className="field" style={{ alignSelf: 'end' }}>
            <button
              type="button"
              onClick={saveHistoryDate}
              disabled={savingHistoryDate}
            >
              {savingHistoryDate ? 'Guardando…' : 'Guardar fecha'}
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Datos del paciente</h2>
        <div className="form-grid">
          <div>
            <span className="muted">Nacimiento</span>
            <div>{patient.birthDate.slice(0, 10)}</div>
          </div>
          <div>
            <span className="muted">Ingreso al centro</span>
            <div>{patient.centerEntryDate.slice(0, 10)}</div>
          </div>
          <div>
            <span className="muted">Ingreso al sistema</span>
            <div>{patient.systemEntryDate.slice(0, 10)}</div>
          </div>
          <div>
            <span className="muted">Género</span>
            <div>{genderLabel[patient.gender] || patient.gender}</div>
          </div>
          <div>
            <span className="muted">Teléfono</span>
            <div>{patient.phone || '—'}</div>
          </div>
          <div>
            <span className="muted">Email</span>
            <div>{patient.email || '—'}</div>
          </div>
          <div>
            <span className="muted">Dirección</span>
            <div>{patient.address || '—'}</div>
          </div>
          <div>
            <span className="muted">Profesional</span>
            <div>
              {patient.professional
                ? `${patient.professional.firstName} ${patient.professional.lastName}`
                : 'Sin asignar'}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '0.75rem' }}>Fases eriksonianas</h2>
      <div className="phase-list">
        {phases.map((phase) => {
          const done = Boolean(phase.currentVersion);
          return (
            <div
              key={phase.id}
              className={`phase-row ${done ? 'done' : 'pending'}`}
            >
              <div className="phase-meta">
                <div>
                  <strong>
                    {phase.phaseTemplate.sortOrder}. {phase.phaseTemplate.name}
                  </strong>
                  <div className="muted">{phase.phaseTemplate.crisis}</div>
                </div>
                <div>
                  {done ? (
                    <span className="badge ok">
                      Completada · {phase.currentVersion!.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="badge">Pendiente</span>
                  )}
                </div>
              </div>
              {done && phase.currentVersion && (
                <div className="muted">
                  Fecha:{' '}
                  {toDateInput(phase.currentVersion.evaluationDate)} · Versión
                  vigente #{phase.currentVersion.versionNumber}
                  {phase.currentVersion.notes
                    ? ` — ${phase.currentVersion.notes}`
                    : ''}
                </div>
              )}
              <div className="actions">
                <button type="button" onClick={() => openEvaluate(phase.id)}>
                  {done ? 'Editar evaluación' : 'Evaluar fase'}
                </button>
                {done && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => openHistory(phase.id)}
                  >
                    Ver historial
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {evaluating && (
        <div className="modal-backdrop" onClick={() => setEvaluatingPhaseId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {evaluating.currentVersion ? 'Editar' : 'Evaluar'}:{' '}
              {evaluating.phaseTemplate.name}
            </h2>
            <p className="muted">Califique cada ítem de 1 a 5</p>
            <form onSubmit={submitEvaluation}>
              <div className="field">
                <label>Fecha de evaluación</label>
                <input
                  type="date"
                  value={evaluationDate}
                  onChange={(e) => setEvaluationDate(e.target.value)}
                  required
                />
              </div>
              {evaluating.phaseTemplate.items.map((item) => (
                <div className="field" key={item.id}>
                  <label>
                    {item.label} — {scores[item.id] ?? 3}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={scores[item.id] ?? 3}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [item.id]: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
              <div className="field">
                <label>Notas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {evaluating.currentVersion && (
                <div className="field">
                  <label>Nota aclaratoria (obligatoria al editar)</label>
                  <textarea
                    rows={3}
                    value={clarificationNote}
                    onChange={(e) => setClarificationNote(e.target.value)}
                    required
                    minLength={5}
                    placeholder="Explique por qué se modifica esta evaluación…"
                  />
                </div>
              )}
              <div className="actions">
                <button type="submit">Guardar versión</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEvaluatingPhaseId(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyPhaseId && (
        <div className="modal-backdrop" onClick={() => setHistoryPhaseId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Historial de versiones</h2>
            <p className="muted">
              Solo la versión vigente se muestra en la consulta principal. Las
              anteriores son de solo lectura.
            </p>
            {history.map((v) => (
              <div className="history-item" key={v.id}>
                <div className="phase-meta">
                  <strong>
                    Versión #{v.versionNumber}
                    {v.isCurrent ? ' (vigente)' : ''}
                  </strong>
                  <span className="badge">{v.score.toFixed(1)} / 5</span>
                </div>
                <div className="muted">
                  Fecha evaluación: {toDateInput(v.evaluationDate)} · Registrado:{' '}
                  {new Date(v.createdAt).toLocaleString('es')} ·{' '}
                  {v.createdBy.email}
                </div>
                {v.clarificationNote && (
                  <p>
                    <strong>Aclaración:</strong> {v.clarificationNote}
                  </p>
                )}
                {v.notes && (
                  <p>
                    <strong>Notas:</strong> {v.notes}
                  </p>
                )}
                <ul>
                  {v.itemScores.map((s) => (
                    <li key={s.id}>
                      {s.phaseItemTemplate.label}: {s.score}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button type="button" className="secondary" onClick={() => setHistoryPhaseId(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
