#!/bin/sh
set -e

echo "Running database schema push..."
cd /app/packages/database
npx prisma db push

if [ "${RAILWAY_RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "Starting API..."
cd /app
exec pnpm --filter @travel/api start
