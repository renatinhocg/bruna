import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

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
    // Busca por teste concluído do usuário
    const teste = await prisma.testeInteligencia.findFirst({
      where: {
        usuario_id: parseInt(usuario_id),
        concluido: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json({
      success: true,
      jaFez: !!teste
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
      const totalPerguntasCategoria = perguntas.filter(p => p.categoria_id === parseInt(categoriaId)).length;
      const valorMaximo = Math.max(...possibilidades.map(p => p.valor));
      const pontuacaoMaximaCategoria = totalPerguntasCategoria * valorMaximo;
      const percentual = pontuacaoMaximaCategoria > 0 ? (dados.pontuacao / pontuacaoMaximaCategoria) * 100 : 0;
      await prisma.resultadoInteligencia.create({
        data: {
          teste_id: teste.id,
          categoria_id: parseInt(categoriaId),
          pontuacao: dados.pontuacao,
          percentual: Math.round(percentual * 100) / 100
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

export default router;
