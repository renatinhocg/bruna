import express from 'express';
import prisma from '../config/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tasks - Listar todas as tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { projeto_id, status, prioridade, responsavel_id } = req.query;
    const where = {};
    
    if (projeto_id) where.projeto_id = parseInt(projeto_id);
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (responsavel_id) where.responsavel_id = parseInt(responsavel_id);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        projeto: {
          select: {
            id: true,
            nome: true,
            cor: true,
            icone: true,
          },
        },
        usuario_responsavel: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
        criador: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            subtasks: true,
            comentarios: true,
          },
        },
      },
      orderBy: [{ ordem: 'asc' }, { created_at: 'desc' }],
    });

    res.json(tasks);
  } catch (error) {
    console.error('Erro ao listar tasks:', error);
    res.status(500).json({ error: 'Erro ao listar tasks' });
  }
});

// GET /api/tasks/:id - Buscar task por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        projeto: true,
        usuario_responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true,
          },
        },
        parent: true,
        subtasks: {
          include: {
            usuario_responsavel: {
              select: {
                id: true,
                nome: true,
                avatar_url: true,
              },
            },
          },
        },
        comentarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { criado_em: 'desc' },
        },
      },
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

// POST /api/tasks - Criar nova task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      projeto_id,
      titulo,
      descricao,
      status,
      prioridade,
      data_inicio,
      data_prevista,
      data_conclusao,
      tags,
      responsavel,
      responsavel_id,
      usuario_id,
      parent_id,
      ordem,
      progresso,
      tempo_estimado,
      anexos,
    } = req.body;

    const task = await prisma.task.create({
      data: {
        projeto_id: projeto_id ? parseInt(projeto_id) : null,
        titulo,
        descricao,
        status: status || 'PLANEJADO',
        prioridade: prioridade || 'MEDIA',
        data_inicio: data_inicio ? new Date(data_inicio) : null,
        data_prevista: data_prevista ? new Date(data_prevista) : null,
        data_conclusao: data_conclusao ? new Date(data_conclusao) : null,
        tags: tags || [],
        responsavel,
        responsavel_id: responsavel_id ? parseInt(responsavel_id) : null,
        usuario_id: usuario_id ? parseInt(usuario_id) : req.user.id,
        parent_id: parent_id ? parseInt(parent_id) : null,
        ordem: ordem ? parseInt(ordem) : 0,
        progresso: progresso ? parseInt(progresso) : 0,
        tempo_estimado: tempo_estimado ? parseInt(tempo_estimado) : null,
        anexos: anexos || [],
      },
      include: {
        projeto: true,
        usuario_responsavel: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
        criador: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Erro ao criar task:', error);
    res.status(500).json({ error: 'Erro ao criar task' });
  }
});

// PUT /api/tasks/:id - Atualizar task
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
      responsavel,
      responsavel_id,
      ordem,
      progresso,
      tempo_estimado,
      anexos,
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
    if (responsavel_id !== undefined) updateData.responsavel_id = responsavel_id ? parseInt(responsavel_id) : null;
    if (ordem !== undefined) updateData.ordem = parseInt(ordem);
    if (progresso !== undefined) updateData.progresso = parseInt(progresso);
    if (tempo_estimado !== undefined) updateData.tempo_estimado = parseInt(tempo_estimado);
    if (anexos !== undefined) updateData.anexos = anexos;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        projeto: true,
        usuario_responsavel: {
          select: {
            id: true,
            nome: true,
            avatar_url: true,
          },
        },
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Erro ao atualizar task:', error);
    res.status(500).json({ error: 'Erro ao atualizar task' });
  }
});

// DELETE /api/tasks/:id - Deletar task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Task deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar task:', error);
    res.status(500).json({ error: 'Erro ao deletar task' });
  }
});

// POST /api/tasks/:id/comentarios - Adicionar comentário
router.post('/:id/comentarios', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { conteudo, usuario_id } = req.body;

    const comentario = await prisma.comentarioTask.create({
      data: {
        task_id: parseInt(id),
        usuario_id: parseInt(usuario_id),
        conteudo,
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

    res.status(201).json(comentario);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

export default router;
