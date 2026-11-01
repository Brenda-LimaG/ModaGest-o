const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /vitrine/marcas — Lista pública de marcas ativas
router.get('/marcas', async (req, res) => {
  try {
    const marcas = await prisma.marca.findMany({
      where: { ativa: true },
      select: {
        id: true, nome: true, descricao: true,
        instagram: true, logoUrl: true,
        _count: { select: { produtos: { where: { publicado: true } } } },
      },
      orderBy: { nome: 'asc' },
    });
    res.json(marcas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar marcas.' });
  }
});

// GET /vitrine/marcas/:id — Detalhes públicos de uma marca
router.get('/marcas/:id', async (req, res) => {
  try {
    const marca = await prisma.marca.findFirst({
      where: { id: req.params.id, ativa: true },
      select: {
        id: true, nome: true, descricao: true,
        telefone: true, instagram: true, logoUrl: true,
      },
    });
    if (!marca) return res.status(404).json({ erro: 'Marca não encontrada.' });
    res.json(marca);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar marca.' });
  }
});

// GET /vitrine/marcas/:id/produtos — Lista pública de produtos publicados
router.get('/marcas/:id/produtos', async (req, res) => {
  try {
    const marca = await prisma.marca.findFirst({
      where: { id: req.params.id, ativa: true },
      select: { id: true, nome: true, telefone: true, instagram: true },
    });
    if (!marca) return res.status(404).json({ erro: 'Marca não encontrada.' });

    const produtos = await prisma.produto.findMany({
      where: { marcaId: req.params.id, publicado: true },
      select: {
        id: true, nome: true, descricao: true,
        fotos: true, precoVenda: true,
      },
      orderBy: { criadoEm: 'desc' },
    });

    res.json({ marca, produtos });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
});

module.exports = router;
