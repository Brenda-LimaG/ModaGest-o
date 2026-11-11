FROM node:20-alpine

WORKDIR /app

# ── Instala dependências do backend ──────────────────────────
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# ── Instala dependências do frontend ─────────────────────────
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# ── Copia todo o código ───────────────────────────────────────
COPY backend ./backend
COPY frontend ./frontend

# ── Build do frontend ─────────────────────────────────────────
RUN cd frontend && npm run build

# ── Troca schema para PostgreSQL e gera o Prisma Client ───────
RUN cp backend/prisma/schema.prod.prisma backend/prisma/schema.prisma
RUN cd backend && npx prisma generate

# ── Porta exposta ─────────────────────────────────────────────
EXPOSE 3001

# ── Roda migrations e inicia o servidor ──────────────────────
CMD cd backend && npx prisma migrate deploy && node src/server.js
