#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:$PATH"
cd /app/apps/api

echo "Waiting for database and applying migrations..."
i=0
until npx prisma migrate deploy --schema=./prisma/schema.prisma; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "Database/migrations failed after 60s"
    exit 1
  fi
  echo "DB not ready, retry $i..."
  sleep 2
done

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts || echo "Seed skipped/failed"
fi

echo "Starting API on port ${PORT:-3000}..."
exec node dist/main.js
