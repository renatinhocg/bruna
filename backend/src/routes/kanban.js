// ...existing code...
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
const prisma = new PrismaClient();

// Middleware de autenticação
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/kanban - Listar todas as tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { projeto_id } = req.query;
    const where = projeto_id ? { projeto_id: Number(projeto_id) } : {};
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { prioridade: 'desc' },
        { created_at: 'desc' }
      ]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tasks:', error);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
});

// GET /api/kanban/:id - Buscar task por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task não encontrada' });
    }

    res.json(task);
  } catch (error) {
    console.error('Erro ao buscar task:', error);
    res.status(500).json({ error: 'Erro ao buscar task' });
  }
});

// POST /api/kanban - Criar nova task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      status = 'PLANEJADO',
      prioridade = 'MEDIA',
      data_prevista,
      data_inicio,
      data_conclusao,
      tags,
      responsavel,
      projeto_id
    } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const task = await prisma.task.create({
      data: {
        titulo,
        descricao,
        status,
        prioridade,
        data_prevista: data_prevista ? new Date(data_prevista) : null,
        data_inicio: data_inicio ? new Date(data_inicio) : null,
        data_conclusao: data_conclusao ? new Date(data_conclusao) : null,
        tags: tags || [],
        responsavel,
        projeto_id: projeto_id ? Number(projeto_id) : null
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar task:', error);
    res.status(500).json({ error: 'Erro ao criar task' });
  }
});

// PUT /api/kanban/:id - Atualizar task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      status,
      prioridade,
      data_inicio,
      data_prevista,
      data_conclusao,
      tags,
      responsavel
    } = req.body;

    const updateData = {};
    
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (status !== undefined) updateData.status = status;
    if (prioridade !== undefined) updateData.prioridade = prioridade;
    if (data_inicio !== undefined) updateData.data_inicio = data_inicio ? new Date(data_inicio) : null;
    if (data_prevista !== undefined) updateData.data_prevista = data_prevista ? new Date(data_prevista) : null;
    if (data_conclusao !== undefined) updateData.data_conclusao = data_conclusao ? new Date(data_conclusao) : null;
    if (tags !== undefined) updateData.tags = tags;
    if (responsavel !== undefined) updateData.responsavel = responsavel;

    // Se mudou para PRODUCAO, registra data de conclusão
    if (status === 'PRODUCAO' && !data_conclusao) {
      updateData.data_conclusao = new Date();
    }

    // Se mudou de PLANEJADO para EM_DESENVOLVIMENTO, registra data de início
    if (status === 'EM_DESENVOLVIMENTO' && !data_inicio) {
      updateData.data_inicio = new Date();
    }

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(task);
  } catch (error) {
    console.error('Erro ao atualizar task:', error);
    res.status(500).json({ error: 'Erro ao atualizar task' });
  }
});

// PATCH /api/kanban/:id/status - Atualizar apenas o status (para drag & drop)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('PATCH /kanban/:id/status', { id, status });


    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }
    // Se status for número, recusar
    if (typeof status === 'number') {
      return res.status(400).json({ error: 'Status deve ser string (PLANEJADO, EM_DESENVOLVIMENTO, HOMOLOGACAO, PRODUCAO). Valor recebido: ' + status });
    }
    // Se status não for um dos valores válidos, recusar
    const validStatus = ['PLANEJADO', 'EM_DESENVOLVIMENTO', 'HOMOLOGACAO', 'PRODUCAO'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: ' + validStatus.join(', ') });
    }
    const updateData = { status };

    // Se mudou para PRODUCAO, registra data de conclusão
    if (status === 'PRODUCAO') {
      updateData.data_conclusao = new Date();
    }

    // Se mudou para EM_DESENVOLVIMENTO e não tem data de início
    const taskAtual = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (status === 'EM_DESENVOLVIMENTO' && !taskAtual.data_inicio) {
      updateData.data_inicio = new Date();
    }

    try {
      const task = await prisma.task.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      console.log('✔️ Status salvo no banco:', task.status);
      res.json(task);
    } catch (prismaError) {
      console.error('Erro do Prisma ao atualizar status:', prismaError);
      res.status(400).json({ error: 'Erro do Prisma', details: prismaError.message });
    }
  } catch (error) {
    console.error('Erro ao atualizar status (catch geral):', error);
    res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
  }
});

// DELETE /api/kanban/:id - Deletar task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Task deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar task:', error);
    res.status(500).json({ error: 'Erro ao deletar task' });
  }
});

// GET /api/kanban/stats - Estatísticas do Kanban
router.get('/stats/resumo', authenticateToken, async (req, res) => {
  try {
    const { projeto_id } = req.query;
    const where = projeto_id ? { projeto_id: Number(projeto_id) } : {};
    const [
      totalPlanejado,
      totalEmDesenvolvimento,
      totalHomologacao,
      totalProducao,
      totalAlta,
      totalUrgente
    ] = await Promise.all([
      prisma.task.count({ where: { ...where, status: 'PLANEJADO' } }),
      prisma.task.count({ where: { ...where, status: 'EM_DESENVOLVIMENTO' } }),
      prisma.task.count({ where: { ...where, status: 'HOMOLOGACAO' } }),
      prisma.task.count({ where: { ...where, status: 'PRODUCAO' } }),
      prisma.task.count({ where: { ...where, prioridade: 'ALTA' } }),
      prisma.task.count({ where: { ...where, prioridade: 'URGENTE' } })
    ]);

    res.json({
      porStatus: {
        planejado: totalPlanejado,
        emDesenvolvimento: totalEmDesenvolvimento,
        homologacao: totalHomologacao,
        producao: totalProducao
      },
      porPrioridade: {
        alta: totalAlta,
        urgente: totalUrgente
      },
      total: totalPlanejado + totalEmDesenvolvimento + totalHomologacao + totalProducao
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
