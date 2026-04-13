import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Buscar todas as questões do teste com suas opções
router.get('/questoes', authenticateToken, async (req, res) => {
  try {
    const questoes = await prisma.questaoDominancia.findMany({
      where: { ativo: true },
      include: {
        opcoes: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { ordem: 'asc' }
    });

    res.json(questoes);
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões do teste' });
  }
});

// Verificar se usuário já fez o teste
router.get('/verificar', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const testeExistente = await prisma.testeDominancia.findFirst({
      where: {
        usuario_id: usuarioId,
        concluido: true,
        autorizado: true
      },
      orderBy: {
        concluido_em: 'desc'
      }
    });

    if (testeExistente) {
      return res.json({
        jaFez: true,
        podeRefazer: false,
        teste: testeExistente
      });
    }

    // Verificar se pode refazer
    const testeNaoAutorizado = await prisma.testeDominancia.findFirst({
      where: {
        usuario_id: usuarioId,
        concluido: true,
        autorizado: false
      },
      orderBy: {
        concluido_em: 'desc'
      }
    });

    if (testeNaoAutorizado) {
      return res.json({
        jaFez: false,
        podeRefazer: true
      });
    }

    res.json({
      jaFez: false,
      podeRefazer: false
    });
  } catch (error) {
    console.error('Erro ao verificar teste:', error);
    res.status(500).json({ error: 'Erro ao verificar teste' });
  }
});

// Iniciar teste
router.post('/iniciar', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Verificar se já existe teste não concluído
    const testeAndamento = await prisma.testeDominancia.findFirst({
      where: {
        usuario_id: usuarioId,
        concluido: false
      }
    });

    if (testeAndamento) {
      return res.json(testeAndamento);
    }

    // Criar novo teste
    const novoTeste = await prisma.testeDominancia.create({
      data: {
        usuario_id: usuarioId,
        concluido: false,
        autorizado: true,
        pontuacao_se: 0,
        pontuacao_sd: 0,
        pontuacao_ie: 0,
        pontuacao_id: 0
      }
    });

    res.json(novoTeste);
  } catch (error) {
    console.error('Erro ao iniciar teste:', error);
    res.status(500).json({ error: 'Erro ao iniciar teste' });
  }
});

// Salvar respostas de uma questão
router.post('/responder', authenticateToken, async (req, res) => {
  try {
    const { teste_id, questao_id, opcoes_ids } = req.body;

    // Validar que são exatamente 4 opções
    if (!Array.isArray(opcoes_ids) || opcoes_ids.length !== 4) {
      return res.status(400).json({ error: 'Você deve selecionar exatamente 4 opções' });
    }

    // Verificar se o teste pertence ao usuário
    const teste = await prisma.testeDominancia.findFirst({
      where: {
        id: teste_id,
        usuario_id: req.user.id
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    // Remover respostas anteriores desta questão (se houver)
    await prisma.respostaDominancia.deleteMany({
      where: {
        teste_id,
        questao_id
      }
    });

    // Salvar as 4 respostas
    const respostas = await Promise.all(
      opcoes_ids.map(opcao_id =>
        prisma.respostaDominancia.create({
          data: {
            teste_id,
            questao_id,
            opcao_id
          }
        })
      )
    );

    res.json({ success: true, respostas });
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ error: 'Erro ao salvar respostas' });
  }
});

// Finalizar teste e calcular resultado
router.post('/finalizar', authenticateToken, async (req, res) => {
  try {
    const { teste_id } = req.body;

    // Verificar se o teste pertence ao usuário
    const teste = await prisma.testeDominancia.findFirst({
      where: {
        id: teste_id,
        usuario_id: req.user.id
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    // Buscar todas as respostas com informações do quadrante
    const respostas = await prisma.respostaDominancia.findMany({
      where: { teste_id },
      include: {
        opcao: true
      }
    });

    // Verificar se tem 32 respostas (8 questões x 4 respostas)
    if (respostas.length !== 32) {
      return res.status(400).json({ 
        error: 'Teste incompleto',
        respostasEncontradas: respostas.length,
        respostasEsperadas: 32
      });
    }

    // Calcular pontuações por quadrante
    const pontuacoes = {
      SE: 0,
      SD: 0,
      IE: 0,
      ID: 0
    };

    respostas.forEach(resposta => {
      const quadrante = resposta.opcao.quadrante;
      pontuacoes[quadrante]++;
    });

    // Calcular percentuais
    const total = 32;
    const percentuais = {
      SE: (pontuacoes.SE / total) * 100,
      SD: (pontuacoes.SD / total) * 100,
      IE: (pontuacoes.IE / total) * 100,
      ID: (pontuacoes.ID / total) * 100
    };

    // Determinar perfil dominante (quadrante com maior pontuação)
    const quadrantesDominantes = Object.entries(pontuacoes)
      .sort((a, b) => b[1] - a[1])
      .map(([quadrante]) => quadrante);

    const perfilDominante = quadrantesDominantes[0];

    // Atualizar teste com resultado
    const testeAtualizado = await prisma.testeDominancia.update({
      where: { id: teste_id },
      data: {
        concluido: true,
        concluido_em: new Date(),
        pontuacao_se: pontuacoes.SE,
        pontuacao_sd: pontuacoes.SD,
        pontuacao_ie: pontuacoes.IE,
        pontuacao_id: pontuacoes.ID,
        percentual_se: percentuais.SE,
        percentual_sd: percentuais.SD,
        percentual_ie: percentuais.IE,
        percentual_id: percentuais.ID,
        perfil_dominante: perfilDominante
      }
    });

    res.json({
      success: true,
      teste: testeAtualizado,
      pontuacoes,
      percentuais,
      perfilDominante
    });
  } catch (error) {
    console.error('Erro ao finalizar teste:', error);
    res.status(500).json({ error: 'Erro ao finalizar teste' });
  }
});

// Buscar resultado do teste do usuário
router.get('/resultado', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const teste = await prisma.testeDominancia.findFirst({
      where: {
        usuario_id: usuarioId,
        concluido: true,
        autorizado: true
      },
      orderBy: {
        concluido_em: 'desc'
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

    if (!teste) {
      return res.status(404).json({ error: 'Resultado não encontrado' });
    }

    res.json(teste);
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    res.status(500).json({ error: 'Erro ao buscar resultado' });
  }
});

// Permitir refazer teste (admin)
router.put('/usuario/:usuarioId/permitir-refazer', authenticateToken, async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Buscar o teste mais recente do usuário
    const teste = await prisma.testeDominancia.findFirst({
      where: {
        usuario_id: parseInt(usuarioId),
        concluido: true
      },
      orderBy: {
        concluido_em: 'desc'
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    // Marcar como não autorizado para permitir refazer
    await prisma.testeDominancia.update({
      where: { id: teste.id },
      data: { autorizado: false }
    });

    res.json({ 
      success: true, 
      message: 'Usuário autorizado a refazer o teste' 
    });
  } catch (error) {
    console.error('Erro ao permitir refazer teste:', error);
    res.status(500).json({ error: 'Erro ao permitir refazer teste' });
  }
});

// Buscar todos os resultados (admin)
router.get('/resultados/todos', authenticateToken, async (req, res) => {
  try {
    const testes = await prisma.testeDominancia.findMany({
      where: {
        concluido: true
      },
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
      orderBy: {
        concluido_em: 'desc'
      }
    });

    res.json(testes);
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ error: 'Erro ao buscar resultados' });
  }
});

// Buscar respostas detalhadas de um teste específico (usuário)
router.get('/minhas-respostas/:testeId', authenticateToken, async (req, res) => {
  try {
    const { testeId } = req.params;
    const usuarioId = req.user.id;

    // Verificar se o teste pertence ao usuário
    const teste = await prisma.testeDominancia.findFirst({
      where: {
        id: parseInt(testeId),
        usuario_id: usuarioId
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    // Buscar todas as respostas
    const respostas = await prisma.respostaDominancia.findMany({
      where: {
        teste_id: parseInt(testeId)
      },
      include: {
        opcao: {
          include: {
            questao: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json(respostas);
  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    res.status(500).json({ error: 'Erro ao buscar respostas' });
  }
});

// Buscar respostas de qualquer teste (admin)
router.get('/respostas/:testeId', authenticateToken, async (req, res) => {
  try {
    const { testeId } = req.params;

    console.log('Verificando permissão admin:', {
      userId: req.user.id,
      tipo: req.user.tipo,
      isAdmin: req.user.tipo === 'admin'
    });

    // Verificar se o usuário é admin (campo 'tipo' no banco)
    if (req.user.tipo !== 'admin') {
      console.log('Acesso negado - usuário não é admin');
      return res.status(403).json({ error: 'Acesso negado', userTipo: req.user.tipo });
    }

    // Buscar todas as respostas
    const respostas = await prisma.respostaDominancia.findMany({
      where: {
        teste_id: parseInt(testeId)
      },
      include: {
        opcao: {
          include: {
            questao: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json(respostas);
  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    res.status(500).json({ error: 'Erro ao buscar respostas' });
  }
});

export default router;
