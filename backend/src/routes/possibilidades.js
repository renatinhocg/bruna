import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/possibilidades - Listar todas as possibilidades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const possibilidades = await prisma.possibilidadeResposta.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        ordem: 'asc'
      }
    });

    res.json({
      success: true,
      data: possibilidades
    });
  } catch (error) {
    console.error('Erro ao buscar possibilidades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/possibilidades/:id - Buscar possibilidade por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const possibilidade = await prisma.possibilidadeResposta.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        pergunta: {
          include: {
            categoria: true
          }
        }
      }
    });

    if (!possibilidade) {
      return res.status(404).json({
        success: false,
        message: 'Possibilidade não encontrada'
      });
    }

    res.json({
      success: true,
      data: possibilidade
    });
  } catch (error) {
    console.error('Erro ao buscar possibilidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/possibilidades - Criar nova possibilidade
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { texto, valor, descricao, ordem } = req.body;

    // Validações
    if (!texto || valor === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Texto e valor são obrigatórios'
      });
    }

    // Se não informou ordem, pegar a próxima disponível
    let ordemFinal = ordem ? parseInt(ordem) : null;
    if (!ordemFinal) {
      const ultimaPossibilidade = await prisma.possibilidadeResposta.findFirst({
        orderBy: { ordem: 'desc' }
      });
      ordemFinal = ultimaPossibilidade ? ultimaPossibilidade.ordem + 1 : 1;
    }

    const novaPossibilidade = await prisma.possibilidadeResposta.create({
      data: {
        texto: texto.trim(),
        valor: parseInt(valor),
        descricao: descricao?.trim() || '',
        ordem: ordemFinal,
        ativo: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Possibilidade criada com sucesso',
      data: novaPossibilidade
    });
  } catch (error) {
    console.error('Erro ao criar possibilidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/possibilidades/:id - Atualizar possibilidade
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, valor, descricao, ordem, ativo } = req.body;

    // Validações
    if (!texto || valor === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Texto e valor são obrigatórios'
      });
    }

    // Verificar se a possibilidade existe
    const possibilidadeExistente = await prisma.possibilidadeResposta.findUnique({
      where: { id: parseInt(id) }
    });

    if (!possibilidadeExistente) {
      return res.status(404).json({
        success: false,
        message: 'Possibilidade não encontrada'
      });
    }

    const possibilidadeAtualizada = await prisma.possibilidadeResposta.update({
      where: { id: parseInt(id) },
      data: {
        texto: texto.trim(),
        valor: parseInt(valor),
        descricao: descricao?.trim() || '',
        ordem: ordem ? parseInt(ordem) : possibilidadeExistente.ordem,
        ativo: ativo !== undefined ? ativo : possibilidadeExistente.ativo,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Possibilidade atualizada com sucesso',
      data: possibilidadeAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar possibilidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/possibilidades/:id - Excluir possibilidade (soft delete)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a possibilidade existe
    const possibilidade = await prisma.possibilidadeResposta.findUnique({
      where: { id: parseInt(id) }
    });

    if (!possibilidade) {
      return res.status(404).json({
        success: false,
        message: 'Possibilidade não encontrada'
      });
    }

    // Soft delete
    await prisma.possibilidadeResposta.update({
      where: { id: parseInt(id) },
      data: {
        ativo: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Possibilidade excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir possibilidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/possibilidades/stats/resumo - Estatísticas das possibilidades
router.get('/stats/resumo', authenticateToken, async (req, res) => {
  try {
    const total = await prisma.possibilidadeResposta.count({
      where: { ativo: true }
    });

    const porPergunta = await prisma.possibilidadeResposta.groupBy({
      by: ['pergunta_id'],
      where: { ativo: true },
      _count: {
        id: true
      }
    });

    const porValor = await prisma.possibilidadeResposta.groupBy({
      by: ['valor'],
      where: { ativo: true },
      _count: {
        id: true
      }
    });

    const mediaValor = await prisma.possibilidadeResposta.aggregate({
      where: { ativo: true },
      _avg: {
        valor: true
      }
    });

    res.json({
      success: true,
      data: {
        total,
        porPergunta,
        porValor,
        mediaValor: mediaValor._avg.valor || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
