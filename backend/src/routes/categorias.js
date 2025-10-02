import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/categorias - Listar todas as categorias
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        nome: 'asc'
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        resultado: true,
        caracteristicas_inteligente: true,
        carreiras_associadas: true,
        cor: true,
        ativo: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            perguntas: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/categorias/:id - Buscar categoria por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoria = await prisma.categoria.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        perguntas: {
          where: {
            ativo: true
          },
          orderBy: {
            ordem: 'asc'
          }
        },
        _count: {
          select: {
            perguntas: true,
            resultados: true
          }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/categorias - Criar nova categoria
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { nome, descricao, resultado, caracteristicas_inteligente, carreiras_associadas, cor } = req.body;

    // Validações
    if (!nome || !descricao || !resultado || !cor) {
      return res.status(400).json({
        success: false,
        message: 'Nome, descrição, resultado e cor são obrigatórios'
      });
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        }
      }
    });

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com esse nome'
      });
    }

    const novaCategoria = await prisma.categoria.create({
      data: {
        nome: nome.trim(),
        descricao: descricao.trim(),
        resultado: resultado.trim(),
        caracteristicas_inteligente: caracteristicas_inteligente?.trim() || null,
        carreiras_associadas: carreiras_associadas?.trim() || null,
        cor: cor.trim(),
        ativo: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: novaCategoria
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/categorias/:id - Atualizar categoria
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, resultado, caracteristicas_inteligente, carreiras_associadas, cor, ativo } = req.body;

    // Validações
    if (!nome || !descricao || !resultado || !cor) {
      return res.status(400).json({
        success: false,
        message: 'Nome, descrição, resultado e cor são obrigatórios'
      });
    }

    // Verificar se a categoria existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!categoriaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se já existe outra categoria com o mesmo nome
    const outraCategoria = await prisma.categoria.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        },
        NOT: {
          id: parseInt(id)
        }
      }
    });

    if (outraCategoria) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com esse nome'
      });
    }

    const categoriaAtualizada = await prisma.categoria.update({
      where: {
        id: parseInt(id)
      },
      data: {
        nome: nome.trim(),
        descricao: descricao.trim(),
        resultado: resultado.trim(),
        caracteristicas_inteligente: caracteristicas_inteligente?.trim() || null,
        carreiras_associadas: carreiras_associadas?.trim() || null,
        cor: cor.trim(),
        ativo: ativo !== undefined ? ativo : true,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoriaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/categorias/:id - Excluir categoria
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        _count: {
          select: {
            perguntas: true,
            resultados: true
          }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se há perguntas associadas
    if (categoria._count.perguntas > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível excluir a categoria. Existem ${categoria._count.perguntas} pergunta(s) associada(s)`
      });
    }

    // Verificar se há resultados associados
    if (categoria._count.resultados > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível excluir a categoria. Existem ${categoria._count.resultados} resultado(s) associado(s)`
      });
    }

    await prisma.categoria.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/categorias/estatisticas - Estatísticas das categorias
router.get('/stats/resumo', authenticateToken, async (req, res) => {
  try {
    const totalCategorias = await prisma.categoria.count({
      where: {
        ativo: true
      }
    });

    const totalPerguntas = await prisma.perguntaInteligencia.count({
      where: {
        ativo: true
      }
    });

    const categoriaComMaisPerguntas = await prisma.categoria.findFirst({
      where: {
        ativo: true
      },
      include: {
        _count: {
          select: {
            perguntas: true
          }
        }
      },
      orderBy: {
        perguntas: {
          _count: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalCategorias,
        totalPerguntas,
        categoriaComMaisPerguntas: categoriaComMaisPerguntas ? {
          nome: categoriaComMaisPerguntas.nome,
          totalPerguntas: categoriaComMaisPerguntas._count.perguntas
        } : null
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
