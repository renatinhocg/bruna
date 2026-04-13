import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Buscar todas as questões do teste DISC com suas opções
router.get('/questoes', authenticateToken, async (req, res) => {
  try {
    const questoes = await prisma.questaoDISC.findMany({
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
    console.error('Erro ao buscar questões DISC:', error);
    res.status(500).json({ error: 'Erro ao buscar questões do teste DISC' });
  }
});

// Verificar se usuário já fez o teste
router.get('/verificar', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const testeExistente = await prisma.testeDISC.findFirst({
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
    const testeNaoAutorizado = await prisma.testeDISC.findFirst({
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
    console.error('Erro ao verificar teste DISC:', error);
    res.status(500).json({ error: 'Erro ao verificar teste' });
  }
});

// Iniciar teste
router.post('/iniciar', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Verificar se já existe teste não concluído
    const testeAndamento = await prisma.testeDISC.findFirst({
      where: {
        usuario_id: usuarioId,
        concluido: false
      }
    });

    if (testeAndamento) {
      return res.json(testeAndamento);
    }

    // Criar novo teste
    const novoTeste = await prisma.testeDISC.create({
      data: {
        usuario_id: usuarioId,
        concluido: false,
        autorizado: true
      }
    });

    res.json(novoTeste);
  } catch (error) {
    console.error('Erro ao iniciar teste DISC:', error);
    res.status(500).json({ error: 'Erro ao iniciar teste DISC' });
  }
});

// Salvar resposta de uma questão
router.post('/responder', authenticateToken, async (req, res) => {
  try {
    const { teste_id, questao_id, opcao_mais_id, opcao_menos_id } = req.body;
    const usuarioId = req.user.id;

    // Verificar se o teste pertence ao usuário
    const teste = await prisma.testeDISC.findFirst({
      where: {
        id: teste_id,
        usuario_id: usuarioId,
        concluido: false
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado ou já concluído' });
    }

    // Verificar se as opções pertencem à questão
    const opcoes = await prisma.opcaoDISC.findMany({
      where: {
        questao_id: questao_id,
        id: {
          in: [opcao_mais_id, opcao_menos_id]
        }
      }
    });

    if (opcoes.length !== 2) {
      return res.status(400).json({ error: 'Opções inválidas' });
    }

    // Verificar se já existe resposta para esta questão
    const respostaExistente = await prisma.respostaDISC.findFirst({
      where: {
        teste_id: teste_id,
        questao_id: questao_id
      }
    });

    if (respostaExistente) {
      // Atualizar resposta existente
      const resposta = await prisma.respostaDISC.update({
        where: { id: respostaExistente.id },
        data: {
          opcao_mais_id,
          opcao_menos_id
        }
      });
      return res.json(resposta);
    }

    // Criar nova resposta
    const resposta = await prisma.respostaDISC.create({
      data: {
        teste_id,
        questao_id,
        opcao_mais_id,
        opcao_menos_id
      }
    });

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao salvar resposta DISC:', error);
    res.status(500).json({ error: 'Erro ao salvar resposta' });
  }
});

// Finalizar teste e calcular resultados
router.post('/finalizar', authenticateToken, async (req, res) => {
  try {
    const { teste_id } = req.body;
    const usuarioId = req.user.id;

    // Buscar teste com respostas
    const teste = await prisma.testeDISC.findFirst({
      where: {
        id: teste_id,
        usuario_id: usuarioId,
        concluido: false
      },
      include: {
        respostas: {
          include: {
            opcao_mais: true,
            opcao_menos: true
          }
        }
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    // Verificar se todas as 24 questões foram respondidas
    if (teste.respostas.length < 24) {
      return res.status(400).json({ 
        error: 'Teste incompleto', 
        questoesRespondidas: teste.respostas.length,
        questoesTotal: 24
      });
    }

    // Calcular pontuações
    const pontuacoes = { D: 0, I: 0, S: 0, C: 0 };

    teste.respostas.forEach(resposta => {
      // Adicionar ponto para a opção "MAIS"
      pontuacoes[resposta.opcao_mais.fator] += 1;
      // Subtrair ponto para a opção "MENOS"
      pontuacoes[resposta.opcao_menos.fator] -= 1;
    });

    // Calcular total e percentuais
    const total = Object.values(pontuacoes).reduce((a, b) => a + Math.abs(b), 0) || 1;
    const percentuais = {
      D: (Math.abs(pontuacoes.D) / total) * 100,
      I: (Math.abs(pontuacoes.I) / total) * 100,
      S: (Math.abs(pontuacoes.S) / total) * 100,
      C: (Math.abs(pontuacoes.C) / total) * 100
    };

    // Determinar perfil primário e secundário
    const fatoresOrdenados = Object.entries(pontuacoes)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    
    const perfilPrimario = fatoresOrdenados[0][0];
    const perfilSecundario = fatoresOrdenados[1][0];
    const estiloCombinado = perfilPrimario + perfilSecundario;

    // Atualizar teste com resultados
    const testeAtualizado = await prisma.testeDISC.update({
      where: { id: teste_id },
      data: {
        concluido: true,
        concluido_em: new Date(),
        pontuacao_d: pontuacoes.D,
        pontuacao_i: pontuacoes.I,
        pontuacao_s: pontuacoes.S,
        pontuacao_c: pontuacoes.C,
        percentual_d: percentuais.D,
        percentual_i: percentuais.I,
        percentual_s: percentuais.S,
        percentual_c: percentuais.C,
        perfil_primario: perfilPrimario,
        perfil_secundario: perfilSecundario,
        estilo_combinado: estiloCombinado
      }
    });

    res.json({
      sucesso: true,
      teste: testeAtualizado,
      pontuacoes,
      percentuais,
      perfilPrimario,
      perfilSecundario,
      estiloCombinado
    });
  } catch (error) {
    console.error('Erro ao finalizar teste DISC:', error);
    res.status(500).json({ error: 'Erro ao finalizar teste' });
  }
});

// Buscar resultado do teste
router.get('/resultado/:testeId', authenticateToken, async (req, res) => {
  try {
    const { testeId } = req.params;
    const usuarioId = req.user.id;

    const teste = await prisma.testeDISC.findFirst({
      where: {
        id: parseInt(testeId),
        usuario_id: usuarioId,
        concluido: true
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
    console.error('Erro ao buscar resultado DISC:', error);
    res.status(500).json({ error: 'Erro ao buscar resultado' });
  }
});

// Buscar último resultado do usuário logado
router.get('/meu-resultado', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const teste = await prisma.testeDISC.findFirst({
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
      return res.status(404).json({ error: 'Você ainda não fez o teste DISC' });
    }

    res.json(teste);
  } catch (error) {
    console.error('Erro ao buscar resultado DISC:', error);
    res.status(500).json({ error: 'Erro ao buscar resultado' });
  }
});

// ============================================
// ROTAS ADMINISTRATIVAS
// ============================================

// Listar todos os testes (admin)
router.get('/admin/testes', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const testes = await prisma.testeDISC.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(testes);
  } catch (error) {
    console.error('Erro ao listar testes DISC:', error);
    res.status(500).json({ error: 'Erro ao listar testes' });
  }
});

// Buscar um teste específico por ID (admin)
router.get('/admin/testes/:id', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;

    const teste = await prisma.testeDISC.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true
          }
        }
      }
    });

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    res.json(teste);
  } catch (error) {
    console.error('Erro ao buscar teste DISC:', error);
    res.status(500).json({ error: 'Erro ao buscar teste' });
  }
});

// Buscar questões (admin - para gerenciamento)
router.get('/admin/questoes', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const questoes = await prisma.questaoDISC.findMany({
      include: {
        opcoes: {
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { ordem: 'asc' }
    });

    res.json(questoes);
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões' });
  }
});

// Atualizar questão (admin)
router.put('/admin/questoes/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;
    const { instrucao, ativo } = req.body;

    const questao = await prisma.questaoDISC.update({
      where: { id: parseInt(id) },
      data: {
        instrucao,
        ativo
      }
    });

    res.json(questao);
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).json({ error: 'Erro ao atualizar questão' });
  }
});

// Atualizar opção (admin)
router.put('/admin/opcoes/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { id } = req.params;
    const { texto, fator, ativo } = req.body;

    const opcao = await prisma.opcaoDISC.update({
      where: { id: parseInt(id) },
      data: {
        texto,
        fator,
        ativo
      }
    });

    res.json(opcao);
  } catch (error) {
    console.error('Erro ao atualizar opção:', error);
    res.status(500).json({ error: 'Erro ao atualizar opção' });
  }
});

// Estatísticas gerais (admin)
router.get('/admin/estatisticas', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const totalTestes = await prisma.testeDISC.count({
      where: { concluido: true }
    });

    const testesPorPerfil = await prisma.testeDISC.groupBy({
      by: ['perfil_primario'],
      where: {
        concluido: true,
        perfil_primario: { not: null }
      },
      _count: true
    });

    const testesRecentes = await prisma.testeDISC.count({
      where: {
        concluido: true,
        concluido_em: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 dias
        }
      }
    });

    res.json({
      totalTestes,
      testesPorPerfil,
      testesRecentes
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
