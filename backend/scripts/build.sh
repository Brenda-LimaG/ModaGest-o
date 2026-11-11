#!/bin/bash
set -e

echo "==> Buildando frontend..."
cd ../frontend
npm install
npm run build
cd ../backend

echo "==> Copiando schema de produção..."
cp prisma/schema.prod.prisma prisma/schema.prisma

echo "==> Gerando Prisma Client para PostgreSQL..."
npx prisma generate

echo "==> Rodando migrations..."
npx prisma migrate deploy

echo "==> Build concluído!"
