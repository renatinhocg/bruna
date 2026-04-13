
import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/testes-inteligencia/admin - Listar todos os testes concluídos (admin)
router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const testes = await prisma.testeInteligencia.findMany({
      where: { concluido: true },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true
          }
        },
        resultados: {
          include: {
            categoria: {
              include: {
                perguntas: {
                  include: {
                    possibilidades: true
                  }
                }
              },
              // Força o relacionamento correto
              // as: 'perguntas' // não necessário, nome já está correto
            }
          },
          orderBy: { percentual: 'desc' },
          take: 1
        }
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    // Busca manualmente todas as perguntas ativas de cada categoria para garantir o cálculo correto
    const categoriasPerguntas = {};
    const categoriasIds = new Set();
    testes.forEach(teste => {
      teste.resultados.forEach(resultado => {
        if (resultado.categoria && resultado.categoria.id) {
          categoriasIds.add(resultado.categoria.id);
        }
      });
    });
    // Busca todas as perguntas ativas dessas categorias
    const perguntasAtivas = await prisma.perguntaInteligencia.findMany({
      where: {
        categoria_id: { in: Array.from(categoriasIds) },
        ativo: true
      },
      include: { possibilidades: true }
    });
    // Agrupa perguntas por categoria
    perguntasAtivas.forEach(p => {
      if (!categoriasPerguntas[p.categoria_id]) categoriasPerguntas[p.categoria_id] = [];
      categoriasPerguntas[p.categoria_id].push(p);
    });
    // Calcula pontuação máxima usando as perguntas ativas
    testes.forEach(teste => {
      teste.resultados.forEach(resultado => {
        if (resultado.categoria && resultado.categoria.id) {
          const perguntas = categoriasPerguntas[resultado.categoria.id] || [];
          let valorMax = 5;
          if (perguntas.length > 0) {
            valorMax = Math.max(...perguntas.map(p => {
              if (p.possibilidades && p.possibilidades.length > 0) {
                return Math.max(...p.possibilidades.map(poss => poss.valor));
              }
              return 5;
            }));
          }
          resultado.pontuacao_maxima = perguntas.length * valorMax;
        } else {
          resultado.pontuacao_maxima = 35;
        }
      });
    });
    const total = await prisma.testeInteligencia.count({ where: { concluido: true } });
    // Log de depuração: pontuacao_maxima de cada resultado
    testes.forEach(teste => {
      teste.resultados.forEach(resultado => {
        console.log('API ADMIN - Categoria:', resultado.categoria?.nome, '| pontuacao_maxima:', resultado.pontuacao_maxima);
      });
    });
    res.json({
      success: true,
      data: testes,
      meta: { total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Erro ao listar testes (admin):', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});


// GET /api/testes-inteligencia/verificar - Verifica se o usuário já fez o teste de inteligências
router.get('/verificar', authenticateToken, async (req, res) => {
  try {
    const { usuario_id } = req.query;
    if (!usuario_id || isNaN(parseInt(usuario_id))) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro usuario_id ausente ou inválido.'
      });
    }
    // Busca por teste concluído E autorizado do usuário
    // Se o teste não está autorizado, o usuário pode fazer novamente
    const teste = await prisma.testeInteligencia.findFirst({
      where: {
        usuario_id: parseInt(usuario_id),
        concluido: true,
        autorizado: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json({
      success: true,
      jaFez: !!teste,
      podeRefazer: !teste
    });
  } catch (error) {
    console.error('Erro ao verificar teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/testes-inteligencia - Criar um novo teste de inteligência
router.post('/', async (req, res) => {
  try {
    const { usuario_id, nome_usuario, email_usuario, respostas } = req.body;
    if (!usuario_id || isNaN(parseInt(usuario_id))) {
      return res.status(400).json({ success: false, message: 'Usuário não identificado. Faça login novamente.' });
    }
    if (!respostas || !Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({ success: false, message: 'Respostas são obrigatórias' });
    }

    // 1. Criar o teste vinculado ao usuário
    const teste = await prisma.testeInteligencia.create({
      data: {
        usuario_id: parseInt(usuario_id),
        nome_usuario: nome_usuario || null,
        email_usuario: email_usuario || null,
        concluido: false,
        autorizado: false,
        pontuacao_total: 0
      }
    });

    // 2. Salvar todas as respostas vinculadas ao teste
    for (const resposta of respostas) {
      await prisma.respostaInteligencia.create({
        data: {
          teste_realizado_id: teste.id,
          pergunta_id: parseInt(resposta.pergunta_id),
          possibilidade_id: parseInt(resposta.possibilidade_id)
        }
      });
    }

    // 3. Calcular pontuação por categoria
    const perguntas = await prisma.perguntaInteligencia.findMany({});
    const possibilidades = await prisma.possibilidadeResposta.findMany({});
    const respostasSalvas = await prisma.respostaInteligencia.findMany({
      where: { teste_realizado_id: teste.id },
      include: { pergunta: true, possibilidade: true }
    });

    const resultadosPorCategoria = {};
    for (const resposta of respostasSalvas) {
      const categoriaId = resposta.pergunta.categoria_id;
      if (!resultadosPorCategoria[categoriaId]) {
        resultadosPorCategoria[categoriaId] = { pontuacao: 0, totalPerguntas: 0, categoria: resposta.pergunta.categoria_id };
      }
      resultadosPorCategoria[categoriaId].pontuacao += resposta.possibilidade.valor;
      resultadosPorCategoria[categoriaId].totalPerguntas += 1;
    }

    // 4. Salvar resultados por categoria
    let pontuacaoTotal = 0;
    let categoriaDominante = null;
    let maiorPercentual = 0;
    for (const categoriaId in resultadosPorCategoria) {
      const dados = resultadosPorCategoria[categoriaId];
      const perguntasDaCategoria = perguntas.filter(p => p.categoria_id === parseInt(categoriaId));
      const perguntaIds = perguntasDaCategoria.map(p => p.id);
      // Considera apenas possibilidades das perguntas da categoria
      const possibilidadesDaCategoria = possibilidades.filter(p => perguntaIds.includes(p.pergunta_id));
      const valorMaximo = possibilidadesDaCategoria.length > 0 ? Math.max(...possibilidadesDaCategoria.map(p => p.valor)) : 5;
      const totalPerguntasCategoria = perguntasDaCategoria.length;
      const pontuacaoMaximaCategoria = totalPerguntasCategoria * valorMaximo;
      let percentual = 0;
      if (pontuacaoMaximaCategoria > 0) {
        percentual = (dados.pontuacao / pontuacaoMaximaCategoria) * 100;
      }
      // Corrige possíveis problemas de arredondamento
      percentual = Math.max(0, Math.min(100, Math.round(percentual * 100) / 100));
      console.log(`[RESULTADO] Categoria ${categoriaId} | Pontuação: ${dados.pontuacao} | Máxima: ${pontuacaoMaximaCategoria} | Percentual: ${percentual}`);
      await prisma.resultadoInteligencia.create({
        data: {
          teste_id: teste.id,
          categoria_id: parseInt(categoriaId),
          pontuacao: dados.pontuacao,
          percentual
        }
      });
      pontuacaoTotal += dados.pontuacao;
      if (percentual > maiorPercentual) {
        maiorPercentual = percentual;
        categoriaDominante = categoriaId;
      }
    }

    // 5. Atualizar teste como concluído e salvar dominante
    await prisma.testeInteligencia.update({
      where: { id: teste.id },
      data: {
        concluido: true,
        pontuacao_total: pontuacaoTotal,
        inteligencia_dominante: categoriaDominante
      }
    });

    res.status(201).json({
      success: true,
      data: { id: teste.id, concluido: true, autorizado: false },
      message: 'Teste enviado com sucesso! Aguarde a liberação do resultado.'
    });
  } catch (error) {
    console.error('Erro ao processar teste:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/testes-inteligencia/:id/autorizar - Autorizar resultado de teste
router.put('/:id/autorizar', authenticateToken, async (req, res) => {
  try {
    const testeId = parseInt(req.params.id);
    const usuarioAutorizador = req.user.id;

    // Verificar se o teste existe
    const teste = await prisma.testeInteligencia.findUnique({
      where: { id: testeId }
    });

    if (!teste) {
      return res.status(404).json({
        success: false,
        message: 'Teste não encontrado'
      });
    }

    if (!teste.concluido) {
      return res.status(400).json({
        success: false,
        message: 'Teste ainda não foi concluído'
      });
    }

    if (teste.autorizado) {
      return res.status(400).json({
        success: false,
        message: 'Teste já foi autorizado'
      });
    }

    // Autorizar o teste
    const testeAutorizado = await prisma.testeInteligencia.update({
      where: { id: testeId },
      data: {
        autorizado: true
      }
    });

    res.json({
      success: true,
      data: testeAutorizado,
      message: 'Teste autorizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao autorizar teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/testes-inteligencia/usuario/:usuarioId/permitir-refazer - Permitir usuário refazer o teste
router.put('/usuario/:usuarioId/permitir-refazer', authenticateToken, async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);

    if (isNaN(usuarioId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário inválido'
      });
    }

    // Marcar o teste mais recente como "não autorizado" para permitir refazer
    // Não deletamos, apenas permitimos que façam outro
    const testeRecente = await prisma.testeInteligencia.findFirst({
      where: { usuario_id: usuarioId },
      orderBy: { created_at: 'desc' }
    });

    if (testeRecente) {
      await prisma.testeInteligencia.update({
        where: { id: testeRecente.id },
        data: { autorizado: false }
      });
    }

    res.json({
      success: true,
      message: 'Usuário liberado para refazer o teste. O histórico anterior foi mantido.'
    });

  } catch (error) {
    console.error('Erro ao permitir refazer teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/testes-inteligencia/:id - Buscar resultado de teste específico
router.get('/:id', async (req, res) => {
  try {
    const { forceAdmin } = req.query;
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    // Validação do parâmetro id
    const idParam = req.params.id;
    if (!idParam || isNaN(parseInt(idParam))) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro id ausente ou inválido.'
      });
    }

    // Verificar se é uma requisição de admin autenticado
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = !!decoded; // Se o token é válido, é admin
      } catch (tokenError) {
        // Token inválido, continuar como usuário normal
        isAdmin = false;
      }
    }

    const teste = await prisma.testeInteligencia.findUnique({
      where: { id: parseInt(idParam) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        resultados: {
          include: {
            categoria: true
          },
          orderBy: {
            percentual: 'desc'
          }
        },
        respostas: {
          select: {
            id: true,
            pergunta: {
              select: {
                id: true,
                texto: true
              }
            },
            possibilidade: {
              select: {
                texto: true,
                valor: true
              }
            }
          }
        }
      }
    });

    if (!teste) {
      return res.status(404).json({
        success: false,
        message: 'Teste não encontrado'
      });
    }

    // Se é admin ou forceAdmin=true, retornar dados completos mesmo não autorizado
    if (isAdmin || forceAdmin === 'true') {
      return res.json({
        success: true,
        data: teste,
        isAdminView: true
      });
    }

    // Se o teste não está autorizado e não é admin, retornar apenas informações básicas
    if (!teste.autorizado) {
      return res.json({
        success: true,
        data: {
          id: teste.id,
          nome_usuario: teste.nome_usuario,
          email_usuario: teste.email_usuario,
          concluido: teste.concluido,
          autorizado: false,
          created_at: teste.created_at
        },
        message: 'Teste concluído. Aguardando autorização para visualizar resultados.'
      });
    }

    res.json({
      success: true,
      data: teste
    });

  } catch (error) {
    console.error('Erro ao buscar teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/testes-inteligencia - Listar testes de inteligência
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (usuario_id) {
      where.usuario_id = parseInt(usuario_id);
    }

    const testes = await prisma.testeInteligencia.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        resultados: {
          include: {
            categoria: true
          },
          orderBy: {
            percentual: 'desc'
          },
          take: 1 // Apenas a categoria dominante
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.testeInteligencia.count({ where });

    res.json({
      success: true,
      data: testes,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Erro ao listar testes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/testes-inteligencia/:id - Deletar teste e todos os dados relacionados
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const testeId = parseInt(req.params.id);
    
    if (isNaN(testeId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do teste inválido'
      });
    }

    // Verificar se o teste existe
    const teste = await prisma.testeInteligencia.findUnique({
      where: { id: testeId }
    });

    if (!teste) {
      return res.status(404).json({
        success: false,
        message: 'Teste não encontrado'
      });
    }

    // Deletar em cascata (Prisma vai deletar automaticamente as relações se configurado)
    // 1. Deletar respostas do teste
    await prisma.respostaTesteInteligencia.deleteMany({
      where: { teste_id: testeId }
    });

    // 2. Deletar resultados do teste
    await prisma.resultadoInteligencia.deleteMany({
      where: { teste_id: testeId }
    });

    // 3. Deletar o teste
    await prisma.testeInteligencia.delete({
      where: { id: testeId }
    });

    res.json({
      success: true,
      message: 'Teste deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
