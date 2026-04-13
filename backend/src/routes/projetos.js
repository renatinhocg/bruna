import express from 'express';
import prisma from '../config/prisma.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projetos - Listar todos os projetos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projetos = await prisma.projeto.findMany({
      orderBy: { criado_em: 'desc' },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
    res.json({ success: true, data: projetos });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar projetos' });
  }
});

// GET /api/projetos/:id - Buscar projeto por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const projeto = await prisma.projeto.findUnique({
      where: { id: parseInt(id) },
      include: { tasks: true }
    });
    if (!projeto) return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
    res.json({ success: true, data: projeto });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar projeto' });
  }
});

// POST /api/projetos - Criar novo projeto
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { nome, descricao, tags, status, cor, icone, tipo, template_id } = req.body;
    const userId = req.user.id;
    
    const projeto = await prisma.projeto.create({
      data: {
        nome,
        descricao,
        tags: tags || [],
        status: status || 'ativo',
        cor: cor || '#3b82f6',
        icone: icone || '📋',
        tipo,
        usuario_id: userId,
        template_id: template_id ? parseInt(template_id) : null
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    // Se foi criado de um template, criar as tasks do template
    if (template_id) {
      const template = await prisma.templateProjeto.findUnique({
        where: { id: parseInt(template_id) }
      });
      
      if (template && template.tasks_template) {
        const tasksTemplate = JSON.parse(template.tasks_template);
        for (const taskData of tasksTemplate) {
          await prisma.task.create({
            data: {
              ...taskData,
              projeto_id: projeto.id,
              usuario_id: userId
            }
          });
        }
      }
    }

    res.json({ success: true, data: projeto });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar projeto' });
  }
});

// PUT /api/projetos/:id - Atualizar projeto
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, tags, status, cor, icone, tipo, data_inicio, data_meta, data_conclusao } = req.body;
    
    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;
    if (cor !== undefined) updateData.cor = cor;
    if (icone !== undefined) updateData.icone = icone;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (data_inicio !== undefined) updateData.data_inicio = data_inicio;
    if (data_meta !== undefined) updateData.data_meta = data_meta;
    if (data_conclusao !== undefined) updateData.data_conclusao = data_conclusao;
    
    const projeto = await prisma.projeto.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
    res.json({ success: true, data: projeto });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar projeto' });
  }
});

// DELETE /api/projetos/:id - Deletar projeto
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.projeto.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ success: false, message: 'Erro ao deletar projeto' });
  }
});

export default router;
