const router = express.Router();
const prisma = new PrismaClient();

// PUT /api/resultados/:id/aprovar - Aprovar resultado de inteligência múltipla
router.put('/:id/aprovar', authenticateToken, isAdmin, async (req, res) => {
  try {
    const resultado = await prisma.resultadoInteligencia.update({
      where: { id: parseInt(req.params.id) },
      data: { aprovado: true },
    });
    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Erro ao aprovar resultado:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});
import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';


// GET /api/resultados - Listar todos os resultados
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { categoria_id } = req.query;
    
    const where = {
      ...(categoria_id && { categoria_id: parseInt(categoria_id) })
    };

    const resultados = await prisma.resultadoInteligencia.findMany({
      where,
      include: {
        teste: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar_url: true
              }
            }
          }
        },
        categoria: {
          include: {
            _count: {
              select: { perguntas: true }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transformar os dados para corresponder ao frontend
    const resultadosFormatados = resultados.map(resultado => {
      const status = resultado.percentual >= 70 ? 'alto' : 
                    resultado.percentual >= 40 ? 'medio' : 'baixo';
      return {
        id: resultado.id,
        usuario: resultado.teste?.usuario || { nome: 'Usuário anônimo', email: '' },
        categoria: resultado.categoria,
        pontuacao: resultado.pontuacao,
        percentual: resultado.percentual,
        status,
        aprovado: resultado.aprovado,
        data_teste: resultado.created_at,
        created_at: resultado.created_at
      };
    });

    res.json({
      success: true,
      data: resultadosFormatados
    });
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/resultados/stats - Estatísticas dos resultados
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await prisma.resultadoInteligencia.count();
    
    const resultados = await prisma.resultadoInteligencia.findMany({
      select: {
        pontuacao: true,
        percentual: true,
        created_at: true,
        teste: {
          select: {
            usuario: {
              select: {
                nome: true
              }
            }
          }
        },
        categoria: {
          select: {
            nome: true
          }
        }
      }
    });

    const mediaPontuacao = resultados.length > 0 
      ? resultados.reduce((acc, r) => acc + (r.pontuacao || 0), 0) / resultados.length 
      : 0;

    const mediaPercentual = resultados.length > 0 
      ? resultados.reduce((acc, r) => acc + (r.percentual || 0), 0) / resultados.length 
      : 0;

    // Criar status baseado no percentual
    const porStatus = resultados.reduce((acc, r) => {
      let status = 'baixo';
      if (r.percentual >= 70) status = 'alto';
      else if (r.percentual >= 40) status = 'medio';
      
      const existing = acc.find(item => item.status === status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status, count: 1 });
      }
      return acc;
    }, []);

    const recentes = resultados
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        usuario: r.teste?.usuario?.nome || 'Usuário anônimo',
        categoria: r.categoria.nome,
        data: r.created_at
      }));

    res.json({
      success: true,
      data: {
        total,
        mediaPontuacao,
        mediaPercentual,
        porStatus,
        recentes
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

// GET /api/resultados/:id - Buscar resultado específico com detalhes
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resultado = await prisma.resultadoInteligencia.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        teste: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar_url: true
              }
            },
            respostas: {
              include: {
                pergunta: {
                  select: {
                    id: true,
                    texto: true,
                    ordem: true
                  }
                },
                possibilidade: {
                  select: {
                    id: true,
                    texto: true,
                    valor: true
                  }
                }
              },
              orderBy: {
                pergunta: {
                  ordem: 'asc'
                }
              }
            }
          }
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            cor: true,
            caracteristicas_inteligente: true,
            carreiras_associadas: true
          }
        }
      }
    });

    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Resultado não encontrado'
      });
    }

    // Formatar dados para corresponder ao frontend
    const resultadoFormatado = {
      id: resultado.id,
      usuario: resultado.teste?.usuario || { nome: 'Usuário anônimo', email: '' },
      categoria: resultado.categoria,
      pontuacao: resultado.pontuacao,
      percentual: resultado.percentual,
      status: resultado.percentual >= 70 ? 'alto' : 
              resultado.percentual >= 40 ? 'medio' : 'baixo',
      data_teste: resultado.created_at,
      created_at: resultado.created_at,
      respostas: resultado.teste?.respostas || []
    };

    res.json({
      success: true,
      data: resultadoFormatado
    });
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/resultados - Criar novo resultado
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('--- [POST /api/resultados] Body recebido:', JSON.stringify(req.body, null, 2));
    const {
      teste_id,
      categoria_id,
      pontuacao,
      percentual
    } = req.body;

    // Validações básicas
    if (!teste_id || !categoria_id) {
      console.log('Faltando teste_id ou categoria_id:', { teste_id, categoria_id });
      return res.status(400).json({
        success: false,
        message: 'Teste e categoria são obrigatórios'
      });
    }

    // Verificar se teste existe
    const teste = await prisma.testeInteligencia.findUnique({
      where: { id: parseInt(teste_id) }
    });
    if (!teste) {
      console.log('Teste não encontrado para id:', teste_id);
      return res.status(404).json({
        success: false,
        message: 'Teste não encontrado'
      });
    }

    // Verificar se categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoria_id) }
    });
    if (!categoria) {
      console.log('Categoria não encontrada para id:', categoria_id);
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Criar resultado
    const resultado = await prisma.resultadoInteligencia.create({
      data: {
        teste_id: parseInt(teste_id),
        categoria_id: parseInt(categoria_id),
        pontuacao,
        percentual
      }
    });

    console.log('Resultado criado com sucesso:', resultado);
    res.status(201).json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao criar resultado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/resultados/:id - Atualizar resultado
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      pontuacao,
      percentual
    } = req.body;

    const resultado = await prisma.resultadoInteligencia.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(pontuacao !== undefined && { pontuacao }),
        ...(percentual !== undefined && { percentual })
      },
      include: {
        teste: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar_url: true
              }
            }
          }
        },
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
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao atualizar resultado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/resultados/:id - Excluir resultado
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verificar se o resultado existe
    const resultado = await prisma.resultadoInteligencia.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Resultado não encontrado'
      });
    }

    // Excluir resultado
    await prisma.resultadoInteligencia.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'Resultado excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir resultado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;