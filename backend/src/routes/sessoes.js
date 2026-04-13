import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /sessoes - Listar todas as sessões (com filtro opcional por usuário)
router.get('/', async (req, res) => {
  try {
    const { usuario_id } = req.query;
    
    const where = {};
    if (usuario_id) {
      where.agendamento = {
        usuario_id: parseInt(usuario_id)
      };
    }
    
    const sessoes = await prisma.sessao.findMany({
      where,
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { criado_em: 'desc' }
    });
    res.json(sessoes);
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ erro: 'Erro ao buscar sessões' });
  }
});

// GET /sessoes/:id - Buscar sessão específica
router.get('/:id', async (req, res) => {
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              }
            }
          }
        }
      }
    });
    if (!sessao) return res.status(404).json({ erro: 'Sessão não encontrada' });
    res.json(sessao);
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    res.status(500).json({ erro: 'Erro ao buscar sessão' });
  }
});

// GET /sessoes/agendamento/:agendamentoId - Buscar sessão por agendamento
router.get('/agendamento/:agendamentoId', async (req, res) => {
  try {
    const sessao = await prisma.sessao.findFirst({
      where: { agendamento_id: parseInt(req.params.agendamentoId) },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              }
            }
          }
        }
      }
    });
    if (!sessao) return res.status(404).json({ erro: 'Sessão não encontrada' });
    res.json(sessao);
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    res.status(500).json({ erro: 'Erro ao buscar sessão' });
  }
});

// POST /sessoes - Criar nova sessão
router.post('/', async (req, res) => {
  try {
    const { agendamento_id, registro_sessao, tarefa_casa, observacoes, documentos } = req.body;

    // Verificar se o agendamento existe
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(agendamento_id) }
    });
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    // Criar a sessão
    const sessao = await prisma.sessao.create({
      data: {
        agendamento_id: parseInt(agendamento_id),
        registro_sessao,
        tarefa_casa,
        observacoes,
        documentos: documentos ? JSON.stringify(documentos) : null
      },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              }
            }
          }
        }
      }
    });

    res.status(201).json(sessao);
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ erro: 'Erro ao criar sessão' });
  }
});

// PUT /sessoes/:id - Atualizar sessão
router.put('/:id', async (req, res) => {
  try {
    const { registro_sessao, tarefa_casa, observacoes, documentos } = req.body;

    const sessao = await prisma.sessao.update({
      where: { id: parseInt(req.params.id) },
      data: {
        registro_sessao,
        tarefa_casa,
        observacoes,
        documentos: documentos ? JSON.stringify(documentos) : null,
        atualizado_em: new Date()
      },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              }
            }
          }
        }
      }
    });

    res.json(sessao);
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    res.status(500).json({ erro: 'Erro ao atualizar sessão' });
  }
});

// DELETE /sessoes/:id - Deletar sessão
router.delete('/:id', async (req, res) => {
  try {
    await prisma.sessao.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
    res.status(500).json({ erro: 'Erro ao deletar sessão' });
  }
});

export default router;
