require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth.routes');
const marcasRoutes  = require('./routes/marcas.routes');
const produtosRoutes = require('./routes/produtos.routes');
const tecidosRoutes = require('./routes/tecidos.routes');
const calculosRoutes = require('./routes/calculos.routes');
const vitrineRoutes = require('./routes/vitrine.routes');
const uploadRoutes  = require('./routes/upload.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// Em produção serve o frontend buildado
const FRONTEND_DIST = path.join(__dirname, '../../frontend/dist');
const fs = require('fs');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// API
app.use('/vitrine', vitrineRoutes);
app.use('/auth',    authRoutes);
app.use('/marcas',  marcasRoutes);
app.use('/produtos', produtosRoutes);
app.use('/tecidos', tecidosRoutes);
app.use('/calculos', calculosRoutes);
app.use('/upload',  uploadRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// SPA fallback — qualquer rota não-API devolve o index.html
if (fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

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
