#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.production ]; then
  echo "Falta .env.production"
  echo "Copia .env.production.example y edítalo:"
  echo "  cp .env.production.example .env.production"
  exit 1
fi

echo "==> Building and starting Wandy (production)"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo ""
echo "Listo. La app debería estar en http://TU_IP:${HTTP_PORT:-80}"
echo "Logs API:  docker compose -f docker-compose.prod.yml logs -f api"
echo "Logs Web:  docker compose -f docker-compose.prod.yml logs -f web"
echo ""
echo "Tras el primer arranque con RUN_SEED=true, pon RUN_SEED=false en .env.production"
