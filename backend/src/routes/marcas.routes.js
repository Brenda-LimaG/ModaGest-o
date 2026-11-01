const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
router.use(authMiddleware);

// GET /marcas/minha-marca — Retorna dados da marca autenticada
router.get('/minha-marca', async (req, res) => {
  try {
    const marca = await prisma.marca.findUnique({
      where: { id: req.marcaId },
      select: {
        id: true, nome: true, email: true, descricao: true,
        telefone: true, instagram: true, logoUrl: true,
        ativa: true, criadoEm: true, atualizadoEm: true,
      },
    });
    if (!marca) return res.status(404).json({ erro: 'Marca não encontrada.' });
    res.json(marca);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar marca.' });
  }
});

// PUT /marcas/minha-marca — Atualiza dados cadastrais
router.put(
  '/minha-marca',
  [
    body('nome').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { nome, descricao, telefone, instagram, logoUrl } = req.body;

    try {
      if (nome) {
        const nomeExiste = await prisma.marca.findFirst({
          where: { nome, id: { not: req.marcaId } },
        });
        if (nomeExiste) return res.status(409).json({ erro: 'Nome de marca já está em uso.' });
      }

      const marca = await prisma.marca.update({
        where: { id: req.marcaId },
        data: { nome, descricao, telefone, instagram, logoUrl },
        select: {
          id: true, nome: true, email: true, descricao: true,
          telefone: true, instagram: true, logoUrl: true, atualizadoEm: true,
        },
      });
      res.json(marca);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao atualizar marca.' });
    }
  }
);

// DELETE /marcas/minha-marca — Desativa conta
router.delete('/minha-marca', async (req, res) => {
  try {
    await prisma.marca.update({
      where: { id: req.marcaId },
      data: { ativa: false },
    });
    res.json({ mensagem: 'Conta desativada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao desativar conta.' });
  }
});

module.exports = router;
