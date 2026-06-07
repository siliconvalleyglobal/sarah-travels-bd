#!/bin/sh
set -e

echo "Running database schema push..."
cd /app/packages/database
npx prisma db push --skip-generate

if [ "${RAILWAY_RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "Starting API..."
cd /app/apps/api
exec node dist/main.js
