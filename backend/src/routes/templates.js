import express from 'express';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/templates - Listar todos os templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tipo, is_publico } = req.query;
    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (is_publico !== undefined) where.is_publico = is_publico === 'true';

    const templates = await prisma.templateProjeto.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            projetos: true,
          },
        },
      },
      orderBy: { criado_em: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({ error: 'Erro ao listar templates' });
  }
});

// GET /api/templates/:id - Buscar template por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.templateProjeto.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
        projetos: {
          select: {
            id: true,
            nome: true,
            criado_em: true,
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    res.json(template);
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    res.status(500).json({ error: 'Erro ao buscar template' });
  }
});

// POST /api/templates - Criar novo template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      nome,
      descricao,
      icone,
      cor,
      tipo,
      tasks_template,
      is_publico,
      usuario_id,
    } = req.body;

    const template = await prisma.templateProjeto.create({
      data: {
        nome,
        descricao,
        icone: icone || '📋',
        cor: cor || '#3b82f6',
        tipo: tipo || 'geral',
        tasks_template: tasks_template ? JSON.stringify(tasks_template) : null,
        is_publico: is_publico !== undefined ? is_publico : true,
        usuario_id: usuario_id ? parseInt(usuario_id) : null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ error: 'Erro ao criar template' });
  }
});

// PUT /api/templates/:id - Atualizar template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      icone,
      cor,
      tipo,
      tasks_template,
      is_publico,
    } = req.body;

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (icone !== undefined) updateData.icone = icone;
    if (cor !== undefined) updateData.cor = cor;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (tasks_template !== undefined) updateData.tasks_template = JSON.stringify(tasks_template);
    if (is_publico !== undefined) updateData.is_publico = is_publico;

    const template = await prisma.templateProjeto.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
      },
    });

    res.json(template);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({ error: 'Erro ao atualizar template' });
  }
});

// DELETE /api/templates/:id - Deletar template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.templateProjeto.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Template deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    res.status(500).json({ error: 'Erro ao deletar template' });
  }
});

export default router;
