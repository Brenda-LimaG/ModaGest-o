# 👗 Moda Gestão — Plataforma para Marcas de Moda

Plataforma para divulgação de pequenas marcas de moda, organização de produtos e tecidos e controle de custos de produção.

## Funcionalidades

- **Cadastro de Marcas** — nome, descrição, contato, Instagram, logo
- **Cadastro de Produtos** — nome, descrição, fotos, preço de venda
- **Catálogo de Tecidos** — tipo, cor, textura, foto, estoque, valor por unidade
- **Vitrine Pública** — catálogo digital acessível sem login
- **Precificação** — cálculo automático de custo e sugestão de preço com margem de lucro

## Stack

| Camada   | Tecnologia                   |
|----------|------------------------------|
| Backend  | Node.js + Express            |
| Banco    | PostgreSQL + Prisma ORM      |
| Auth     | JWT + bcrypt                 |
| Frontend | React + Vite                 |

## Como rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com sua DATABASE_URL e JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## Estrutura do projeto

```
├── backend/
│   ├── prisma/schema.prisma    # Modelos do banco
│   ├── src/
│   │   ├── routes/             # Auth, Marcas, Produtos, Tecidos, Vitrine
│   │   ├── services/           # Lógica de precificação
│   │   ├── middleware/         # Autenticação JWT
│   │   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Vitrine.jsx         # Vitrine pública
        │   ├── MarcaDetalhe.jsx    # Página da marca
        │   ├── Login.jsx / Cadastro.jsx
        │   └── painel/             # Painel administrativo
        ├── context/AuthContext.jsx
        └── api/axios.js
```

## Cálculo de Precificação

```
Preço Sugerido = Custo Total ÷ (1 − Margem%)

Exemplo:
  Tecido: R$30/m × 1,5m = R$45
  Outros custos: R$20
  Custo Total: R$65
  Margem 40%: R$65 ÷ 0,60 = R$108,33
```
