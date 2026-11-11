const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const { calcularPrecificacao } = require('../services/precificacao.service');

const router = express.Router();
router.use(authMiddleware);

/** SQLite não tem arrays — fotos são salvas como JSON string */
function normalizarProduto(p) {
  if (!p) return p;
  const fotos = (() => { try { return JSON.parse(p.fotosJson || '[]'); } catch { return []; } })();
  const { fotosJson, ...rest } = p;
  return { ...rest, fotos };
}

// GET /produtos — Lista produtos da marca autenticada
router.get('/', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: { marcaId: req.marcaId },
      include: {
        tecidosUsados: {
          include: { tecido: { select: { id: true, nome: true, unidadeMedida: true } } },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
    res.json(produtos.map(normalizarProduto));
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar produtos.' });
  }
});

// POST /produtos — Cria novo produto
router.post(
  '/',
  [
    body('nome').trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres.'),
    body('precoVenda').optional().isFloat({ gt: 0 }).withMessage('Preço de venda deve ser positivo.'),
    body('outrosCustos').optional().isFloat({ min: 0 }).withMessage('Outros custos devem ser ≥ 0.'),
    body('margemLucroPct').optional().isFloat({ min: 0, max: 99.99 }).withMessage('Margem deve estar entre 0 e 99,99.'),
    body('tecidosUtilizados').optional().isArray(),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const {
      nome, descricao, fotos = [], precoVenda,
      outrosCustos = 0, margemLucroPct = null,
      tecidosUtilizados = [],
    } = req.body;

    try {
      const calculo = await calcularPrecificacao(req.marcaId, tecidosUtilizados, outrosCustos, margemLucroPct);

      const produto = await prisma.produto.create({
        data: {
          marcaId: req.marcaId,
          nome,
          descricao,
          fotosJson: JSON.stringify(fotos),
          precoVenda: precoVenda ?? null,
          outrosCustos: calculo.outrosCustos,
          custoTecidos: calculo.custoTecidos,
          custoTotal: calculo.custoTotal,
          margemLucroPct: calculo.margemLucroPct,
          precoSugerido: calculo.precoSugerido,
          tecidosUsados: {
            create: calculo.detalheTecidos.map((d, i) => ({
              tecidoId: d.tecidoId,
              quantidade: Number(tecidosUtilizados[i].quantidade),
              custoCalculado: d.custoCalculado,
            })),
          },
        },
        include: {
          tecidosUsados: {
            include: { tecido: { select: { id: true, nome: true, unidadeMedida: true } } },
          },
        },
      });

      res.status(201).json(normalizarProduto(produto));
    } catch (err) {
      res.status(err.status || 500).json({ erro: err.message });
    }
  }
);

// GET /produtos/:id — Detalhes do produto
router.get('/:id', async (req, res) => {
  try {
    const produto = await prisma.produto.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
      include: { tecidosUsados: { include: { tecido: true } } },
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(normalizarProduto(produto));
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
});

// PUT /produtos/:id — Atualiza produto
router.put('/:id', async (req, res) => {
  const {
    nome, descricao, fotos, precoVenda,
    outrosCustos = 0, margemLucroPct = null,
    tecidosUtilizados = [],
  } = req.body;

  try {
    const existe = await prisma.produto.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
    });
    if (!existe) return res.status(404).json({ erro: 'Produto não encontrado.' });

    const calculo = await calcularPrecificacao(req.marcaId, tecidosUtilizados, outrosCustos, margemLucroPct);

    await prisma.produtoTecido.deleteMany({ where: { produtoId: req.params.id } });

    const fotosAtuais = fotos !== undefined ? JSON.stringify(fotos) : existe.fotosJson;

    const produto = await prisma.produto.update({
      where: { id: req.params.id },
      data: {
        nome,
        descricao,
        fotosJson: fotosAtuais,
        precoVenda: precoVenda !== undefined ? precoVenda : existe.precoVenda,
        outrosCustos: calculo.outrosCustos,
        custoTecidos: calculo.custoTecidos,
        custoTotal: calculo.custoTotal,
        margemLucroPct: calculo.margemLucroPct,
        precoSugerido: calculo.precoSugerido,
        tecidosUsados: {
          create: calculo.detalheTecidos.map((d, i) => ({
            tecidoId: d.tecidoId,
            quantidade: Number(tecidosUtilizados[i].quantidade),
            custoCalculado: d.custoCalculado,
          })),
        },
      },
      include: {
        tecidosUsados: { include: { tecido: { select: { id: true, nome: true, unidadeMedida: true } } } },
      },
    });

    res.json(normalizarProduto(produto));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message });
  }
});

// DELETE /produtos/:id — Remove produto
router.delete('/:id', async (req, res) => {
  try {
    const existe = await prisma.produto.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
    });
    if (!existe) return res.status(404).json({ erro: 'Produto não encontrado.' });

    await prisma.produto.delete({ where: { id: req.params.id } });
    res.json({ mensagem: 'Produto removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover produto.' });
  }
});

// PUT /produtos/:id/publicar — Alterna visibilidade pública
router.put('/:id/publicar', async (req, res) => {
  try {
    const produto = await prisma.produto.findFirst({
      where: { id: req.params.id, marcaId: req.marcaId },
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

    const atualizado = await prisma.produto.update({
      where: { id: req.params.id },
      data: { publicado: !produto.publicado },
      select: { id: true, nome: true, publicado: true },
    });
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao alterar visibilidade.' });
  }
});

module.exports = router;
