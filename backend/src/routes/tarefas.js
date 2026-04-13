import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar tarefas do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tarefas = await prisma.tarefaCasa.findMany({
      where: { usuario_id: req.user.id },
      orderBy: [
        { concluida: 'asc' },
        { data: 'asc' }
      ]
    });

    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ erro: 'Erro ao listar tarefas' });
  }
});

// Listar tarefas concluídas do usuário
router.get('/concluidas', authenticateToken, async (req, res) => {
  try {
    const tarefasConcluidas = await prisma.tarefaSessaoConcluida.findMany({
      where: { usuario_id: req.user.id },
      orderBy: { criado_em: 'desc' }
    });

    // Buscar as sessões relacionadas
    const tarefasComSessao = await Promise.all(
      tarefasConcluidas.map(async (tarefa) => {
        const sessao = await prisma.sessao.findUnique({
          where: { id: tarefa.sessao_id },
          select: {
            id: true,
            tarefa_casa: true,
            criado_em: true
          }
        });
        return {
          ...tarefa,
          sessao
        };
      })
    );

    res.json(tarefasComSessao);
  } catch (error) {
    console.error('Erro ao listar tarefas concluídas:', error);
    res.status(500).json({ erro: 'Erro ao listar tarefas concluídas' });
  }
});

// Criar nova tarefa (admin apenas - opcional)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { titulo, descricao, data, usuario_id } = req.body;
    
    // Se admin, pode criar tarefa para outro usuário
    const targetUserId = req.user.tipo === 'admin' && usuario_id ? usuario_id : req.user.id;

    const tarefa = await prisma.tarefaCasa.create({
      data: {
        usuario_id: targetUserId,
        titulo,
        descricao,
        data: new Date(data)
      }
    });

    res.json(tarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ erro: 'Erro ao criar tarefa' });
  }
});

// Marcar tarefa de sessão como concluída
router.post('/sessao/:sessaoId/concluir', authenticateToken, async (req, res) => {
  try {
    const { sessaoId } = req.params;

    // Criar ou atualizar registro de conclusão
    const tarefaConcluida = await prisma.tarefaSessaoConcluida.upsert({
      where: {
        usuario_id_sessao_id: {
          usuario_id: req.user.id,
          sessao_id: parseInt(sessaoId)
        }
      },
      update: {
        concluida: true
      },
      create: {
        usuario_id: req.user.id,
        sessao_id: parseInt(sessaoId),
        concluida: true
      }
    });

    res.json({ success: true, tarefa: tarefaConcluida });
  } catch (error) {
    console.error('Erro ao marcar tarefa como concluída:', error);
    res.status(500).json({ erro: 'Erro ao marcar tarefa como concluída' });
  }
});

// Atualizar tarefa (marcar como concluída)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { concluida, titulo, descricao, data } = req.body;

    // Verificar se a tarefa pertence ao usuário
    const tarefa = await prisma.tarefaCasa.findFirst({
      where: {
        id: parseInt(id),
        usuario_id: req.user.id
      }
    });

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    const tarefaAtualizada = await prisma.tarefaCasa.update({
      where: { id: parseInt(id) },
      data: {
        ...(concluida !== undefined && { concluida }),
        ...(titulo && { titulo }),
        ...(descricao && { descricao }),
        ...(data && { data: new Date(data) })
      }
    });

    res.json(tarefaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
  }
});

// Deletar tarefa
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a tarefa pertence ao usuário (ou se é admin)
    const tarefa = await prisma.tarefaCasa.findFirst({
      where: {
        id: parseInt(id),
        ...(req.user.tipo !== 'admin' && { usuario_id: req.user.id })
      }
    });

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    await prisma.tarefaCasa.delete({
      where: { id: parseInt(id) }
    });

    res.json({ mensagem: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ erro: 'Erro ao deletar tarefa' });
  }
});

export default router;
