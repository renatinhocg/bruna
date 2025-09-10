import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /agendamentos - Listar agendamentos (com filtro opcional por usuário)
router.get('/', async (req, res) => {
  try {
    const { usuario_id, status } = req.query;
    const where = {};
    if (usuario_id) where.usuario_id = parseInt(usuario_id);
    if (status) where.status = status;

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true
          }
        }
      },
      orderBy: { data_hora: 'asc' }
    });
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

// GET /agendamentos/:id - Buscar agendamento específico
router.get('/:id', async (req, res) => {
  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            avatar_url: true
          }
        }
      }
    });
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar agendamento' });
  }
});

// POST /agendamentos - Criar novo agendamento
router.post('/', async (req, res) => {
  try {
    const { usuario_id, titulo, descricao, data_hora, duracao_minutos, tipo } = req.body;

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) }
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const agendamento = await prisma.agendamento.create({
      data: {
        usuario_id: parseInt(usuario_id),
        titulo,
        descricao,
        data_hora: new Date(data_hora),
        duracao_minutos: duracao_minutos || 60,
        tipo: tipo || 'sessao'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    res.status(201).json(agendamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
});

// PUT /agendamentos/:id - Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descricao, data_hora, duracao_minutos, status, tipo } = req.body;
    
    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (data_hora !== undefined) updateData.data_hora = new Date(data_hora);
    if (duracao_minutos !== undefined) updateData.duracao_minutos = duracao_minutos;
    if (status !== undefined) updateData.status = status;
    if (tipo !== undefined) updateData.tipo = tipo;

    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento' });
  }
});

// DELETE /agendamentos/:id - Excluir agendamento permanentemente
router.delete('/:id', async (req, res) => {
  try {
    await prisma.agendamento.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ erro: 'Erro ao excluir agendamento' });
  }
});

// PATCH /agendamentos/:id/status - Atualizar apenas o status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

export default router;