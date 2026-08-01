export type Role = 'ADMIN' | 'PROFESSIONAL';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';

export type User = {
  id: string;
  email: string;
  role: Role;
  professional: { id: string; firstName: string; lastName: string } | null;
};

export type PatientType = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type Professional = {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gender: Gender;
  specialty: string | null;
  active: boolean;
  user: { id: string; email: string; role: Role };
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gender: Gender;
  birthDate: string;
  systemEntryDate: string;
  centerEntryDate: string;
  patientTypeId: string;
  professionalId: string | null;
  patientType: PatientType;
  professional: { id: string; firstName: string; lastName: string } | null;
};

export type PhaseUnlockMode = 'ALL_OPEN' | 'SEQUENTIAL';

export type CriterionTemplate = {
  id: string;
  sortOrder: number;
  label: string;
  weightPct: number;
  active?: boolean;
};

export type SubgroupTemplate = {
  id: string;
  sortOrder: number;
  unlockRank: number;
  name: string;
  purpose: string | null;
  hideInUi: boolean;
  weightPct: number;
  criteria: CriterionTemplate[];
};

export type PhaseTemplate = {
  id: string;
  sortOrder: number;
  name: string;
  description: string | null;
  unlockMode: PhaseUnlockMode;
  weightPct: number;
  active?: boolean;
  subgroups: SubgroupTemplate[];
};

export type PatientCriterionView = {
  id: string;
  score: number;
  criterionTemplate: {
    id: string;
    sortOrder: number;
    label: string;
    weightPct: number;
  };
};

export type PatientSubgroupView = {
  id: string;
  score: number;
  approved: boolean;
  unlocked: boolean;
  subgroupTemplate: {
    id: string;
    sortOrder: number;
    unlockRank: number;
    name: string;
    purpose: string | null;
    hideInUi: boolean;
    weightPct: number;
  };
  criteria: PatientCriterionView[];
};

export type PatientPhaseView = {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  score: number;
  approved: boolean;
  unlocked: boolean;
  phaseTemplate: {
    id: string;
    sortOrder: number;
    name: string;
    description: string | null;
    unlockMode: PhaseUnlockMode;
    weightPct: number;
  };
  subgroups: PatientSubgroupView[];
};

export type ClinicalHistoryView = {
  patient: Patient;
  clinicalHistoryId: string;
  historyDate: string;
  globalScore: number;
  approvalThreshold: number;
  phases: PatientPhaseView[];
};

export type ScoreChangeLog = {
  id: string;
  previousScore: number;
  newScore: number;
  changedAt: string;
  changedBy: { id: string; email: string; role: Role };
};

export type DashboardStats = {
  totals: {
    patients: number;
    professionals: number;
    patientTypes: number;
    phaseTemplates: number;
    evaluations: number;
  };
  scores: {
    averageGlobal: number | null;
    patientsWithEvaluations: number;
    patientsWithoutEvaluations: number;
    fullyCompleted: number;
  };
  phases: {
    id: string;
    sortOrder: number;
    name: string;
    description: string | null;
    approvedCount: number;
    pendingCount: number;
    averageScore: number | null;
  }[];
  byPatientType: { name: string; count: number }[];
  patients: {
    id: string;
    firstName: string;
    lastName: string;
    document: string;
    patientType: string;
    completedPhases: number;
    totalPhases: number;
    pendingPhases: number;
    globalScore: number | null;
    currentPhase: {
      name: string;
      sortOrder: number;
      status: 'PENDING' | 'COMPLETED';
      score?: number;
    } | null;
    lastCompletedPhase: {
      name: string;
      sortOrder: number;
      score: number;
    } | null;
  }[];
};

const TOKEN_KEY = 'wandy_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const base =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
    '';
  const res = await fetch(`${base}/api${path}`, { ...options, headers });
  if (!res.ok) {
    let message = 'Error en la solicitud';
    try {
      const body = await res.json();
      message = body.message
        ? Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message
        : message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
