#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:$PATH"
export NODE_PATH="/app/node_modules${NODE_PATH:+:$NODE_PATH}"
cd /app/apps/api

# Encode password so special characters (@ # : / etc.) don't break the URL
export DATABASE_URL="$(
  node -e "
    const user = process.env.POSTGRES_USER || 'wandy';
    const pass = encodeURIComponent(process.env.POSTGRES_PASSWORD || '');
    const host = process.env.POSTGRES_HOST || 'postgres';
    const port = process.env.POSTGRES_PORT || '5432';
    const db = process.env.POSTGRES_DB || 'wandy';
    process.stdout.write('postgresql://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?schema=public');
  "
)"

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

if [ -f dist/main.js ]; then
  MAIN=dist/main.js
elif [ -f dist/src/main.js ]; then
  MAIN=dist/src/main.js
else
  echo "ERROR: Nest build output not found. Contents of dist:"
  ls -laR dist || true
  exit 1
fi

echo "Starting API on port ${PORT:-3000} ($MAIN)..."
exec node "$MAIN"
