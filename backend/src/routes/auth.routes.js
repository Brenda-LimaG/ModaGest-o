const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// POST /auth/cadastro — Cria conta da marca
router.post(
  '/cadastro',
  [
    body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { nome, email, senha, descricao, telefone, instagram } = req.body;

    try {
      const existe = await prisma.marca.findUnique({ where: { email } });
      if (existe) return res.status(409).json({ erro: 'Este email já está cadastrado.' });

      const nomeExiste = await prisma.marca.findUnique({ where: { nome } });
      if (nomeExiste) return res.status(409).json({ erro: 'Este nome de marca já está em uso.' });

      const senhaHash = await bcrypt.hash(senha, 12);

      const marca = await prisma.marca.create({
        data: { nome, email, senhaHash, descricao, telefone, instagram },
        select: { id: true, nome: true, email: true, criadoEm: true },
      });

      const token = jwt.sign({ marcaId: marca.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      });

      res.status(201).json({ marca, token });
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao criar conta.' });
    }
  }
);

// POST /auth/login — Autentica e retorna token JWT
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha é obrigatória.'),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });

    const { email, senha } = req.body;

    try {
      const marca = await prisma.marca.findUnique({ where: { email } });
      if (!marca || !marca.ativa) return res.status(401).json({ erro: 'Credenciais inválidas.' });

      const senhaValida = await bcrypt.compare(senha, marca.senhaHash);
      if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas.' });

      const token = jwt.sign({ marcaId: marca.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      });

      res.json({
        token,
        marca: { id: marca.id, nome: marca.nome, email: marca.email },
      });
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao realizar login.' });
    }
  }
);

// GET /auth/perfil — Retorna dados da marca autenticada
router.get('/perfil', authMiddleware, async (req, res) => {
  try {
    const marca = await prisma.marca.findUnique({
      where: { id: req.marcaId },
      select: {
        id: true, nome: true, email: true, descricao: true,
        telefone: true, instagram: true, logoUrl: true, criadoEm: true,
      },
    });
    if (!marca) return res.status(404).json({ erro: 'Marca não encontrada.' });
    res.json(marca);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
});

module.exports = router;
