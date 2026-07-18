#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.production ]; then
  echo "Falta .env.production"
  echo "  cp .env.production.example .env.production"
  exit 1
fi

get_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" .env.production | tail -n 1 || true)"
  echo "${line#*=}" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

VITE_API_URL="$(get_env VITE_API_URL)"
RUN_SEED="$(get_env RUN_SEED)"
HTTP_PORT="$(get_env HTTP_PORT)"
API_PORT="$(get_env API_PORT)"

HTTP_PORT="${HTTP_PORT:-8085}"
API_PORT="${API_PORT:-3085}"

if [ -z "$VITE_API_URL" ] || [[ "$VITE_API_URL" == *"TU_IP"* ]]; then
  echo "ERROR: define VITE_API_URL real en .env.production"
  echo "Ejemplo: VITE_API_URL=http://177.7.40.130:3085"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js no está instalado"
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Instalando PM2 global..."
  sudo npm install -g pm2
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker no está instalado (hace falta para Postgres)"
  exit 1
fi

echo "==> Deteniendo stack Docker completo (api/web) si existe..."
docker compose -f docker-compose.prod.yml --env-file .env.production down 2>/dev/null || true

echo "==> Levantando solo Postgres (Docker)..."
docker compose -f docker-compose.db.yml --env-file .env.production up -d

echo "==> Esperando Postgres..."
sleep 5

echo "==> Instalando dependencias npm..."
npm ci

echo "==> API: prisma generate + migrate + build..."
cd apps/api
npx prisma generate
# DATABASE_URL for CLI from .env.production values via node encode
export DATABASE_URL="$(
  node -e "
    const fs=require('fs');
    const env={};
    for (const line of fs.readFileSync('../../.env.production','utf8').split(/\\r?\\n/)) {
      const t=line.trim(); if(!t||t.startsWith('#')) continue;
      const i=t.indexOf('='); if(i<0) continue;
      let v=t.slice(i+1).trim(); if((v.startsWith('\"')&&v.endsWith('\"'))||(v.startsWith(\"'\")&&v.endsWith(\"'\"))) v=v.slice(1,-1);
      env[t.slice(0,i).trim()]=v;
    }
    const u=env.POSTGRES_USER||'wandy';
    const p=encodeURIComponent(env.POSTGRES_PASSWORD||'');
    const h=env.POSTGRES_HOST||'127.0.0.1';
    const port=env.POSTGRES_PORT||'5434';
    const d=env.POSTGRES_DB||'wandy';
    process.stdout.write('postgresql://'+u+':'+p+'@'+h+':'+port+'/'+d+'?schema=public');
  "
)"
npx prisma migrate deploy
npm run build
if [ "${RUN_SEED}" = "true" ]; then
  echo "==> Seed..."
  npx tsx prisma/seed.ts || true
fi
cd "$ROOT_DIR"

echo "==> Web: build (VITE_API_URL=$VITE_API_URL)..."
cd apps/web
VITE_API_URL="$VITE_API_URL" npm run build
cd "$ROOT_DIR"

echo "==> Arrancando PM2..."
pm2 delete wandy-api wandy-web 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "Listo."
echo "  Front: http://TU_IP:${HTTP_PORT}"
echo "  API:   ${VITE_API_URL}"
echo ""
echo "  pm2 status"
echo "  pm2 logs wandy-api"
echo ""
echo "Autostart al reiniciar la VPS (ejecutar una vez):"
echo "  pm2 startup"
echo "  pm2 save"
echo ""
echo "Si RUN_SEED=true, cámbialo a false en .env.production"
