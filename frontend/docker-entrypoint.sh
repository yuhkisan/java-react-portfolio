#!/bin/sh
set -eu

if [ ! -f /data/dev.db ]; then
  rm -f /data/.bootstrap.db /data/.bootstrap.db-journal /data/.bootstrap.db-shm /data/.bootstrap.db-wal
  DATABASE_URL=file:/data/.bootstrap.db npx prisma db push
  DATABASE_URL=file:/data/.bootstrap.db npm run db:seed
  mv /data/.bootstrap.db /data/dev.db
fi

export DATABASE_URL=file:/data/dev.db
npx prisma db push
exec npm run dev -- --hostname 0.0.0.0
