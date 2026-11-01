require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const marcasRoutes = require('./routes/marcas.routes');
const produtosRoutes = require('./routes/produtos.routes');
const tecidosRoutes = require('./routes/tecidos.routes');
const calculosRoutes = require('./routes/calculos.routes');
const vitrineRoutes = require('./routes/vitrine.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos de upload localmente
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// Rotas públicas
app.use('/vitrine', vitrineRoutes);

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/marcas', marcasRoutes);
app.use('/produtos', produtosRoutes);
app.use('/tecidos', tecidosRoutes);
app.use('/calculos', calculosRoutes);
app.use('/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Handler de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});

module.exports = app;
