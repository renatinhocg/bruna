import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
const prisma = new PrismaClient();
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ROTA TEMPORÁRIA: Listar todas as tasks (inclusive órfãs)
router.get('/manutencao/listar-todas-tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { status: 'asc' },
        { prioridade: 'desc' },
        { created_at: 'desc' }
      ]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar todas as tasks:', error);
    res.status(500).json({ error: 'Erro ao buscar todas as tasks' });
  }
});

// ROTA TEMPORÁRIA: Deletar task por ID
router.delete('/manutencao/deletar-task/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: 'Task deletada com sucesso', id });
  } catch (error) {
    console.error('Erro ao deletar task:', error);
    res.status(500).json({ error: 'Erro ao deletar task' });
  }
});

export default router;
