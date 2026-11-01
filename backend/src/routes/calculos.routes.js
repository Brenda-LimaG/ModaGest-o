const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const { calcularPrecificacao } = require('../services/precificacao.service');

const router = express.Router();
router.use(authMiddleware);

// POST /calculos/precificacao — Calcula custo e preço sugerido (sem salvar)
router.post(
  '/precificacao',
  [
    body('tecidosUtilizados').optional().isArray(),
    body('outrosCustos').optional().isFloat({ min: 0 }).withMessage('Outros custos devem ser ≥ 0.'),
    body('margemLucroPct').optional().isFloat({ min: 0, max: 99.99 }).withMessage('Margem deve estar entre 0 e 99,99.'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { tecidosUtilizados = [], outrosCustos = 0, margemLucroPct = null } = req.body;

    try {
      const resultado = await calcularPrecificacao(req.marcaId, tecidosUtilizados, outrosCustos, margemLucroPct);
      res.json(resultado);
    } catch (err) {
      res.status(err.status || 500).json({ erro: err.message });
    }
  }
);

module.exports = router;
