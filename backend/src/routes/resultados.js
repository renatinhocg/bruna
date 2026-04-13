
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/resultados/usuario/:usuarioId - Resultados de múltiplas inteligências de um usuário específico (admin)
router.get('/usuario/:usuarioId', authenticateToken, async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    if (isNaN(usuarioId)) {
      return res.status(400).json({ success: false, message: 'ID de usuário inválido' });
    }
    // Buscar todos os resultados de testes de múltiplas inteligências desse usuário
    const testes = await prisma.testeInteligencia.findMany({
      where: { usuario_id: usuarioId, concluido: true },
      include: {
        resultados: {
          include: { categoria: true },
          orderBy: { percentual: 'desc' }
        },
        usuario: {
          select: { id: true, nome: true, email: true, avatar_url: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    // Formatar resultados para o frontend, incluindo pontuacao_maxima
    const resultados = [];
    for (const teste of testes) {
      for (const r of teste.resultados) {
        // Buscar perguntas ativas da categoria
        let pontuacao_maxima = 35;
        if (r.categoria && r.categoria.id) {
          const perguntas = await prisma.perguntaInteligencia.findMany({
            where: { categoria_id: r.categoria.id, ativo: true },
            include: { possibilidades: true }
          });
          let valorMax = 5;
          if (perguntas.length > 0) {
            valorMax = Math.max(...perguntas.map(p => {
              if (p.possibilidades && p.possibilidades.length > 0) {
                return Math.max(...p.possibilidades.map(poss => poss.valor));
              }
              return 5;
            }));
          }
          pontuacao_maxima = perguntas.length * valorMax;
        }
        resultados.push({
          id: r.id,
          usuario: teste.usuario,
          categoria: r.categoria,
          pontuacao: r.pontuacao,
          percentual: r.percentual,
          status: teste.autorizado ? 'Autorizado' : 'Pendente',
          data_teste: teste.created_at,
          created_at: teste.created_at,
          autorizado: teste.autorizado,
          pontuacao_maxima,
          _count: undefined
        });
      }
    }
    res.json({ success: true, data: resultados });
  } catch (error) {
    console.error('Erro ao buscar resultados do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});


// GET /api/resultados - Listar todos os testes realizados pelo usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Buscando resultados para usuário:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    const userId = req.user.id;
    
    console.log('📊 Buscando testes DISC...');
    const testesDISC = await prisma.testeDISC.findMany({
      where: { usuario_id: userId },
      select: {
        id: true,
        created_at: true,
        iniciado_em: true
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('✅ DISC encontrados:', testesDISC.length);
    
    console.log('📊 Buscando testes Inteligência...');
    const testesInteligencia = await prisma.testeInteligencia.findMany({
      where: { usuario_id: userId },
      select: {
        id: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('✅ Inteligência encontrados:', testesInteligencia.length);
    
    console.log('📊 Buscando testes Dominância...');
    const testesDominancia = await prisma.testeDominancia.findMany({
      where: { usuario_id: userId },
      select: {
        id: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('✅ Dominância encontrados:', testesDominancia.length);

    // Formatar todos os testes com tipo_teste
    const todosOsTestes = [
      ...testesDISC.map(t => ({ ...t, tipo_teste: 'disc' })),
      ...testesInteligencia.map(t => ({ ...t, tipo_teste: 'inteligencias' })),
      ...testesDominancia.map(t => ({ ...t, tipo_teste: 'dominancia' }))
    ].sort((a, b) => {
      const dataA = new Date(a.created_at || a.iniciado_em);
      const dataB = new Date(b.created_at || b.iniciado_em);
      return dataB - dataA; // Mais recente primeiro
    });

    console.log(`✅ Total de testes do usuário ${userId}:`, todosOsTestes.length);
    
    res.json(todosOsTestes);
  } catch (error) {
    console.error('❌ Erro ao buscar resultados:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
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
                    ordem: true,
                    categoria_id: true
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