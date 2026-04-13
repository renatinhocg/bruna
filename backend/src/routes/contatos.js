import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = Router();
const prisma = new PrismaClient();

// POST - Criar novo contato
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, mensagem, impulso } = req.body;

    // Validação básica
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ 
        erro: 'Nome, email e mensagem são obrigatórios' 
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        erro: 'Email inválido' 
      });
    }

    const contato = await prisma.contato.create({
      data: {
        nome,
        email,
        telefone: telefone || null,
        mensagem,
        status: 'novo',
        impulso: impulso === true || impulso === 'true' ? true : false
      }
    });

    res.status(201).json({
      mensagem: 'Contato enviado com sucesso! Entraremos em contato em breve.',
      contato
    });
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({ erro: 'Erro ao enviar mensagem' });
  }
});

// GET - Listar todos os contatos (para o admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = status ? { status } : {};

    const contatos = await prisma.contato.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(contatos);
  } catch (error) {
    console.error('Erro ao listar contatos:', error);
    res.status(500).json({ erro: 'Erro ao listar contatos' });
  }
});

// GET - Obter contato por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contato = await prisma.contato.findUnique({
      where: { id: parseInt(id) }
    });

    if (!contato) {
      return res.status(404).json({ erro: 'Contato não encontrado' });
    }

    res.json(contato);
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({ erro: 'Erro ao buscar contato' });
  }
});

// PATCH - Atualizar status do contato
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['novo', 'lido', 'respondido'].includes(status)) {
      return res.status(400).json({ 
        erro: 'Status inválido. Use: novo, lido ou respondido' 
      });
    }

    const contato = await prisma.contato.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json(contato);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

// DELETE - Deletar contato
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contato.delete({
      where: { id: parseInt(id) }
    });

    res.json({ mensagem: 'Contato deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar contato:', error);
    res.status(500).json({ erro: 'Erro ao deletar contato' });
  }
});

// GET - Estatísticas de contatos
router.get('/stats/resumo', async (req, res) => {
  try {
    const total = await prisma.contato.count();
    const novos = await prisma.contato.count({ where: { status: 'novo' } });
    const lidos = await prisma.contato.count({ where: { status: 'lido' } });
    const respondidos = await prisma.contato.count({ where: { status: 'respondido' } });

    res.json({
      total,
      novos,
      lidos,
      respondidos
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
  }
});

export default router;
