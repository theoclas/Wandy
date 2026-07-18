import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  type Patient,
  type PatientType,
  type Professional,
} from '../api';

function toDateInput(value: string) {
  return value.slice(0, 10);
}

const emptyForm = {
  firstName: '',
  lastName: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  gender: 'UNSPECIFIED',
  birthDate: '',
  centerEntryDate: '',
  patientTypeId: '',
  professionalId: '',
};

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [types, setTypes] = useState<PatientType[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [p, t, pr] = await Promise.all([
      api<Patient[]>('/patients'),
      api<PatientType[]>('/patient-types'),
      api<Professional[]>('/professionals'),
    ]);
    setPatients(p);
    setTypes(t.filter((x) => x.active));
    setProfessionals(pr.filter((x) => x.active));
    if (!form.patientTypeId && t[0]) {
      setForm((f) => ({ ...f, patientTypeId: t[0].id }));
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      patientTypeId: types[0]?.id || '',
      centerEntryDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  }

  function openEdit(patient: Patient) {
    setEditing(patient);
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      document: patient.document,
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      gender: patient.gender,
      birthDate: toDateInput(patient.birthDate),
      centerEntryDate: toDateInput(patient.centerEntryDate),
      patientTypeId: patient.patientTypeId,
      professionalId: patient.professionalId || '',
    });
    setShowForm(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      professionalId: form.professionalId || undefined,
    };
    try {
      if (editing) {
        await api(`/patients/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/patients', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Pacientes</h1>
        <button type="button" onClick={openCreate}>
          Nuevo paciente
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {showForm && (
        <div className="panel">
          <h2>{editing ? 'Editar paciente' : 'Alta de paciente'}</h2>
          <form onSubmit={onSubmit} className="form-grid">
            <div className="field">
              <label>Nombre</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Apellido</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Documento</label>
              <input
                value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Dirección</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Género</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="UNSPECIFIED">No especificado</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div className="field">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Ingreso al centro</label>
              <input
                type="date"
                value={form.centerEntryDate}
                onChange={(e) =>
                  setForm({ ...form, centerEntryDate: e.target.value })
                }
                required
              />
            </div>
            {editing && (
              <div className="field">
                <label>Ingreso al sistema (no editable)</label>
                <input
                  type="date"
                  value={toDateInput(editing.systemEntryDate)}
                  disabled
                />
              </div>
            )}
            <div className="field">
              <label>Tipo de paciente</label>
              <select
                value={form.patientTypeId}
                onChange={(e) =>
                  setForm({ ...form, patientTypeId: e.target.value })
                }
                required
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Profesional</label>
              <select
                value={form.professionalId}
                onChange={(e) =>
                  setForm({ ...form, professionalId: e.target.value })
                }
              >
                <option value="">Sin asignar</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ alignSelf: 'end' }}>
              <div className="actions">
                <button type="submit">Guardar</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Tipo</th>
              <th>Ingreso centro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.firstName} {p.lastName}
                </td>
                <td>{p.document}</td>
                <td>{p.patientType.name}</td>
                <td>{toDateInput(p.centerEntryDate)}</td>
                <td>
                  <div className="actions">
                    <Link to={`/patients/${p.id}`}>
                      <button type="button">Historia</button>
                    </Link>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => openEdit(p)}
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
