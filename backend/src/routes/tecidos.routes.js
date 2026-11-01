const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

const validacoesTecido = [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('valorPorUnidade').isFloat({ gt: 0 }).withMessage('Valor por unidade deve ser maior que zero.'),
  body('quantidadeEstoque').isFloat({ min: 0 }).withMessage('Quantidade em estoque deve ser ≥ 0.'),
  body('unidadeMedida').optional().isIn(['metro', 'kg', 'unidade']).withMessage('Unidade inválida.'),
];

// GET /tecidos — Lista tecidos da marca autenticada
router.get('/', async (req, res) => {
  try {
    const tecidos = await prisma.tecido.findMany({
      where: { marcaId: req.marcaId },
      orderBy: { criadoEm: 'desc' },
    });
    res.json(tecidos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar tecidos.' });
  }
});

// POST /tecidos — Cadastra novo tecido
router.post('/', validacoesTecido, async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  const { nome, tipo, cor, textura, fotoUrl, quantidadeEstoque, unidadeMedida, valorPorUnidade } = req.body;

  try {
    const tecido = await prisma.tecido.create({
      data: {
        marcaId: req.marcaId,
        nome, tipo, cor, textura, fotoUrl,
        quantidadeEstoque: quantidadeEstoque ?? 0,
        unidadeMedida: unidadeMedida ?? 'metro',
        valorPorUnidade,
      },
    });
    res.status(201).json(tecido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar tecido.' });
  }
});

// GET /tecidos/:id — Detalhes do tecido
router.get('/:id', async (req, res) => {
  try {
    const tecido = await prisma.tecido.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
    });
    if (!tecido) return res.status(404).json({ erro: 'Tecido não encontrado.' });
    res.json(tecido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar tecido.' });
  }
});

// PUT /tecidos/:id — Atualiza tecido
router.put('/:id', validacoesTecido, async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

  const { nome, tipo, cor, textura, fotoUrl, quantidadeEstoque, unidadeMedida, valorPorUnidade } = req.body;

  try {
    const existe = await prisma.tecido.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
    });
    if (!existe) return res.status(404).json({ erro: 'Tecido não encontrado.' });

    const tecido = await prisma.tecido.update({
      where: { id: req.params.id },
      data: { nome, tipo, cor, textura, fotoUrl, quantidadeEstoque, unidadeMedida, valorPorUnidade },
    });
    res.json(tecido);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar tecido.' });
  }
});

// DELETE /tecidos/:id — Remove tecido
router.delete('/:id', async (req, res) => {
  try {
    const existe = await prisma.tecido.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
    });
    if (!existe) return res.status(404).json({ erro: 'Tecido não encontrado.' });

    await prisma.tecido.delete({ where: { id: req.params.id } });
    res.json({ mensagem: 'Tecido removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover tecido.' });
  }
});

module.exports = router;
