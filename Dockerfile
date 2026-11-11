FROM node:20-alpine

# OpenSSL necessário para o Prisma no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# ── Dependências do backend ───────────────────────────────────
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# ── Dependências do frontend ──────────────────────────────────
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# ── Código fonte ──────────────────────────────────────────────
COPY backend ./backend
COPY frontend ./frontend

# ── Build do frontend ─────────────────────────────────────────
RUN cd frontend && npm run build

# ── Schema PostgreSQL + Prisma Client ─────────────────────────
RUN cp backend/prisma/schema.prod.prisma backend/prisma/schema.prisma
RUN cd backend && npx prisma generate

# ── Script de startup ─────────────────────────────────────────
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3001

CMD ["sh", "./start.sh"]
