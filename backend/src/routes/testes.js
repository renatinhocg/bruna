import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
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

// GET /testes - Listar todos os testes (para admin listar todos, para usuários apenas ativos)
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const isAuthenticated = authHeader && authHeader.split(' ')[1];
    
    let whereClause = { ativo: true };
    
    // Se for admin autenticado, mostrar todos os testes
    if (isAuthenticated) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await prisma.usuario.findUnique({
          where: { id: decoded.id }
        });
        
        if (usuario && usuario.tipo === 'admin') {
          whereClause = {}; // Admin vê todos os testes
        }
      } catch (error) {
        // Se token inválido, continua com whereClause original
      }
    }

    const testes = await prisma.teste.findMany({
      where: whereClause,
      select: {
        id: true,
        titulo: true,  // nome -> titulo
        descricao: true,
        ativo: true,
        criado_em: true,  // created_at -> criado_em
        atualizado_em: true,  // updated_at -> atualizado_em
        _count: {
          select: {
            perguntas: true
          }
        }
      },
      orderBy: { criado_em: 'desc' }  // created_at -> criado_em
    });

    // Adicionar total_perguntas aos resultados
    const testesComContador = testes.map(teste => ({
      ...teste,
      total_perguntas: teste._count.perguntas
    }));

    res.json(testesComContador);
  } catch (error) {
    console.error('Erro ao buscar testes:', error);
    res.status(500).json({ erro: 'Erro ao buscar testes' });
  }
});

// GET /testes/:id - Buscar teste específico
router.get('/:id', async (req, res) => {
  try {
    const teste = await prisma.teste.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        perguntas: {
          include: {
            respostas: true
          },
          orderBy: { ordem: 'asc' }
        }
      }
    });
    if (!teste) return res.status(404).json({ erro: 'Teste não encontrado' });
    res.json(teste);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar teste' });
  }
});

// POST /testes - Criar novo teste (apenas admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      nome_usuario,
      email_usuario,
      concluido,
      pontuacao_total,
      tempo_resposta,
      inteligencia_dominante
    } = req.body;

    const teste = await prisma.testeInteligencia.create({
      data: {
        usuario_id: req.user.id,
        nome_usuario,
        email_usuario,
        concluido,
        pontuacao_total,
        tempo_resposta,
        inteligencia_dominante
      }
    });

    res.status(201).json(teste);
  } catch (error) {
    console.error('Erro ao criar teste:', error);
    res.status(500).json({ erro: 'Erro ao criar teste' });
  }
});

// PUT /testes/:id - Atualizar teste (apenas admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { nome, descricao, ativo } = req.body;
    
    const teste = await prisma.teste.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        ...(nome && { nome }),
        ...(descricao && { descricao }),
        ...(ativo !== undefined && { ativo })
      }
    });
    
    res.json(teste);
  } catch (error) {
    console.error('Erro ao atualizar teste:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Teste não encontrado' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar teste' });
  }
});

// DELETE /testes/:id - Deletar teste (apenas admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.teste.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ mensagem: 'Teste excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir teste:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ erro: 'Teste não encontrado' });
    }
    res.status(500).json({ erro: 'Erro ao excluir teste' });
  }
});

export default router;