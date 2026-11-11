#!/bin/sh
set -e

echo "==> Rodando migrations..."
cd /app/backend
npx prisma migrate deploy

echo "==> Iniciando servidor..."
exec node src/server.js
