import { FormEvent, useEffect, useState } from 'react';
import { api, type PatientType } from '../api';
import { useAuth } from '../auth';

export function PatientTypesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<PatientType[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  async function load() {
    setItems(await api<PatientType[]>('/patient-types'));
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/patient-types', {
        method: 'POST',
        body: JSON.stringify({ name, description: description || undefined }),
      });
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  async function toggleActive(item: PatientType) {
    await api(`/patient-types/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !item.active }),
    });
    await load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tipos de paciente</h1>
      </div>
      {error && <div className="error">{error}</div>}
      {isAdmin && (
        <div className="panel">
          <h2>Agregar tipo</h2>
          <form onSubmit={onCreate} className="form-grid">
            <div className="field">
              <label>Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Descripción</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field" style={{ alignSelf: 'end' }}>
              <button type="submit">Guardar</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description || '—'}</td>
                <td>
                  <span className={`badge ${item.active ? 'ok' : ''}`}>
                    {item.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => toggleActive(item)}
                    >
                      {item.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
