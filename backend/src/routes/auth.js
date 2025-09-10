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

// Rota de cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  
  try {
    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash: senhaHash,
        telefone: telefone || null
      }
    });
    
    // Gerar token
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      usuario: {
        id: novoUsuario.id,
        email: novoUsuario.email,
        nome: novoUsuario.nome
      }
    });
    
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    
    // Gerar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo
      }
    });
    
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// Rota para obter dados do usuário logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
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
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

export default router;
