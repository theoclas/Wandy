#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:$PATH"

echo "Waiting for database..."
i=0
until node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.\$connect().then(()=>p.\$disconnect()).then(()=>process.exit(0)).catch(()=>process.exit(1))" ; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "Database not ready after 60s"
    exit 1
  fi
  echo "DB not ready, retry $i..."
  sleep 2
done

echo "Running migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts || echo "Seed skipped/failed"
fi

echo "Starting API on port ${PORT:-3000}..."
exec node dist/main.js
