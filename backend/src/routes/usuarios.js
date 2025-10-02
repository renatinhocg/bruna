import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é admin
const isAdmin = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    });

    if (!usuario || usuario.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar todos os usuários
router.get('/', authenticateToken, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        status: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const usuario = await prisma.usuario.findUnique({
      where: { id: idInt },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        status: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Criar novo usuário
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { nome, email, telefone, tipo, status, senha } = req.body;

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha || '123456', 10);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash: senhaHash,
        telefone: telefone || null,
        tipo: tipo || 'cliente',
        status: status || 'ativo',
        updated_at: new Date()
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        status: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      }
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, tipo, status, senha } = req.body;

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar se email já está em uso por outro usuário
    if (email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email }
      });

      if (emailExistente) {
        return res.status(400).json({ erro: 'Email já está em uso' });
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      nome,
      email,
      telefone: telefone || null,
      tipo: tipo || 'cliente',
      status: status || 'ativo'
    };

    // Se senha foi fornecida, incluir no hash
    if (senha) {
      dadosAtualizacao.senha_hash = await bcrypt.hash(senha, 10);
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        status: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      }
    });

    res.json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Deletar usuário
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id) }
    });

    if (!usuarioExistente) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Não permitir deletar o próprio usuário
    if (usuarioExistente.id === req.user.id) {
      return res.status(400).json({ erro: 'Não é possível deletar seu próprio usuário' });
    }

    // Deletar usuário
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Estatísticas de usuários
router.get('/stats/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsuarios = await prisma.usuario.count();
    const usuariosAtivos = await prisma.usuario.count({
      where: { status: 'ativo' }
    });
    const usuariosInativos = await prisma.usuario.count({
      where: { status: 'inativo' }
    });
    const admins = await prisma.usuario.count({
      where: { tipo: 'admin' }
    });
    const clientes = await prisma.usuario.count({
      where: { tipo: 'cliente' }
    });

    // Usuários cadastrados nos últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const novosUsuarios = await prisma.usuario.count({
      where: {
        created_at: {
          gte: trintaDiasAtras
        }
      }
    });

    res.json({
      totalUsuarios,
      usuariosAtivos,
      usuariosInativos,
      admins,
      clientes,
      novosUsuarios
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

export default router;
