import { FormEvent, useEffect, useState } from 'react';
import { api, type Professional } from '../api';

const empty = {
  firstName: '',
  lastName: '',
  document: '',
  phone: '',
  specialty: '',
  userEmail: '',
  password: '',
};

export function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setItems(await api<Professional[]>('/professionals'));
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/professionals', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(empty);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Profesionales</h1>
        <button type="button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo profesional'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {showForm && (
        <div className="panel">
          <form onSubmit={onCreate} className="form-grid">
            {(
              [
                ['firstName', 'Nombre'],
                ['lastName', 'Apellido'],
                ['document', 'Documento'],
                ['phone', 'Teléfono'],
                ['specialty', 'Especialidad'],
                ['userEmail', 'Email de usuario'],
                ['password', 'Contraseña'],
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label>{label}</label>
                <input
                  type={key === 'password' ? 'password' : key === 'userEmail' ? 'email' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={['firstName', 'lastName', 'document', 'userEmail', 'password'].includes(key)}
                  minLength={key === 'password' ? 6 : undefined}
                />
              </div>
            ))}
            <div className="field" style={{ alignSelf: 'end' }}>
              <button type="submit">Crear</button>
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
              <th>Especialidad</th>
              <th>Usuario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.firstName} {p.lastName}
                </td>
                <td>{p.document}</td>
                <td>{p.specialty || '—'}</td>
                <td>{p.user.email}</td>
                <td>
                  <span className={`badge ${p.active ? 'ok' : ''}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
