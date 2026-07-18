import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { Layout } from './pages/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ProfessionalsPage } from './pages/ProfessionalsPage';
import { PatientTypesPage } from './pages/PatientTypesPage';
import { PhasesPage } from './pages/PhasesPage';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted" style={{ padding: '2rem' }}>Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="phases" element={<PhasesPage />} />
            <Route element={<AdminRoute />}>
              <Route path="professionals" element={<ProfessionalsPage />} />
              <Route path="patient-types" element={<PatientTypesPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
