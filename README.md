# Wandy — Historia clínica eriksoniana

Monorepo con API NestJS + Prisma (PostgreSQL) y frontend React (Vite).

## Requisitos

- Node.js 20+
- Docker (PostgreSQL local o stack completo de producción)

> En desarrollo, PostgreSQL del contenedor escucha en el puerto **5433**.

## Arranque rápido (desarrollo)

```bash
# 1. Base de datos
docker compose up -d

# 2. Dependencias (desde la raíz)
npm install

# 3. Migraciones y seed
cd apps/api
npx prisma migrate dev
npm run prisma:seed
cd ../..

# 4. API (puerto 3000)
npm run dev:api

# 5. Web (puerto 5173) — en otra terminal
npm run dev:web
```

Abre http://localhost:5173

### Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@wandy.local` | `Admin123!` |
| Profesional | `profesional@wandy.local` | `Prof123!` |

## Despliegue en VPS

Ver la guía completa: **[DEPLOY.md](DEPLOY.md)**

Resumen:

```bash
cp .env.production.example .env.production
# Edita secretos y CORS_ORIGIN
./deploy/deploy.sh
```

Eso levanta Postgres + API + Nginx (frontend) con Docker.

## Variables de entorno (desarrollo)

Copia [`apps/api/.env.example`](apps/api/.env.example) a `apps/api/.env`:

```
DATABASE_URL="postgresql://wandy:wandy@127.0.0.1:5433/wandy?schema=public"
JWT_SECRET="wandy-dev-secret-change-in-production"
JWT_EXPIRES_IN="8h"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

## Funcionalidades

- Autenticación JWT con roles `ADMIN` y `PROFESSIONAL`
- Profesionales con usuario y contraseña
- Pacientes con fechas: nacimiento (editable), ingreso al centro (editable), ingreso al sistema (solo lectura)
- Catálogo de tipos de paciente (admin)
- Plantillas de fases eriksonianas e ítems editables
- Historia clínica por paciente con evaluación 1–5, versionado e historial con nota aclaratoria obligatoria al editar
- Calificación global = promedio de las fases evaluadas (vigentes)
- Dashboard con totales y progreso por fases

## API principal

- `POST /api/auth/login` · `GET /api/auth/me`
- `GET /api/dashboard`
- `CRUD /api/patient-types`
- `CRUD /api/professionals`
- `CRUD /api/patients`
- `CRUD /api/phase-templates` (+ ítems)
- `GET|PATCH /api/patients/:id/clinical-history`
- `POST /api/patients/:id/phases/:phaseId/versions`
- `GET /api/patients/:id/phases/:phaseId/versions`
