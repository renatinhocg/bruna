import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/perguntas - Listar todas as perguntas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { categoria_id } = req.query;
    
    const where = {
      ativo: true,
      ...(categoria_id && { categoria_id: parseInt(categoria_id) })
    };

    const perguntas = await prisma.perguntaInteligencia.findMany({
      where,
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
            cor: true
          }
        },
        _count: {
          select: {
            possibilidades: true
          }
        }
      },
      orderBy: [
        { categoria_id: 'asc' },
        { ordem: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: perguntas
    });
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/perguntas/:id - Buscar pergunta por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const pergunta = await prisma.perguntaInteligencia.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        categoria: true,
        _count: {
          select: {
            possibilidades: true
          }
        }
      }
    });

    if (!pergunta) {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }

    res.json({
      success: true,
      data: pergunta
    });
  } catch (error) {
    console.error('Erro ao buscar pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/perguntas - Criar nova pergunta
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { texto, categoria_id, tipo, ordem, obrigatoria } = req.body;

    // Validações
    if (!texto || !categoria_id || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Texto, categoria e tipo são obrigatórios'
      });
    }

    // Verificar se a categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoria_id) }
    });

    if (!categoria) {
      return res.status(400).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Se não informou ordem, pegar a próxima disponível
    let ordemFinal = ordem ? parseInt(ordem) : null;
    if (!ordemFinal) {
      const ultimaPergunta = await prisma.perguntaInteligencia.findFirst({
        where: { categoria_id: parseInt(categoria_id) },
        orderBy: { ordem: 'desc' }
      });
      ordemFinal = ultimaPergunta ? ultimaPergunta.ordem + 1 : 1;
    }

    const novaPergunta = await prisma.perguntaInteligencia.create({
      data: {
        texto: texto.trim(),
        categoria_id: parseInt(categoria_id),
        tipo: tipo.trim(),
        ordem: ordemFinal,
        obrigatoria: obrigatoria !== undefined ? obrigatoria : true,
        ativo: true
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
            cor: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pergunta criada com sucesso',
      data: novaPergunta
    });
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/perguntas/:id - Atualizar pergunta
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, categoria_id, tipo, ordem, obrigatoria, ativo } = req.body;

    // Validações
    if (!texto || !categoria_id || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Texto, categoria e tipo são obrigatórios'
      });
    }

    // Verificar se a pergunta existe
    const perguntaExistente = await prisma.perguntaInteligencia.findUnique({
      where: { id: parseInt(id) }
    });

    if (!perguntaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }

    // Verificar se a categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoria_id) }
    });

    if (!categoria) {
      return res.status(400).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    const perguntaAtualizada = await prisma.perguntaInteligencia.update({
      where: { id: parseInt(id) },
      data: {
        texto: texto.trim(),
        categoria_id: parseInt(categoria_id),
        tipo: tipo.trim(),
        ordem: ordem ? parseInt(ordem) : perguntaExistente.ordem,
        obrigatoria: obrigatoria !== undefined ? obrigatoria : perguntaExistente.obrigatoria,
        ativo: ativo !== undefined ? ativo : perguntaExistente.ativo,
        updated_at: new Date()
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
            cor: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Pergunta atualizada com sucesso',
      data: perguntaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/perguntas/:id - Excluir pergunta (soft delete)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a pergunta existe
    const pergunta = await prisma.perguntaInteligencia.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pergunta) {
      return res.status(404).json({
        success: false,
        message: 'Pergunta não encontrada'
      });
    }

    // Soft delete
    await prisma.perguntaInteligencia.update({
      where: { id: parseInt(id) },
      data: {
        ativo: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Pergunta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir pergunta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/perguntas/stats/resumo - Estatísticas das perguntas
router.get('/stats/resumo', authenticateToken, async (req, res) => {
  try {
    const total = await prisma.perguntaInteligencia.count({
      where: { ativo: true }
    });

    const porCategoria = await prisma.perguntaInteligencia.groupBy({
      by: ['categoria_id'],
      where: { ativo: true },
      _count: {
        id: true
      }
    });

    const porTipo = await prisma.perguntaInteligencia.groupBy({
      by: ['tipo'],
      where: { ativo: true },
      _count: {
        id: true
      }
    });

    const obrigatorias = await prisma.perguntaInteligencia.count({
      where: { 
        ativo: true,
        obrigatoria: true
      }
    });

    res.json({
      success: true,
      data: {
        total,
        obrigatorias,
        opcionais: total - obrigatorias,
        porCategoria,
        porTipo
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
