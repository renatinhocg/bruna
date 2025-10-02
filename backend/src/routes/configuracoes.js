import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/configuracoes - Buscar configurações do sistema
router.get('/', authenticateToken, async (req, res) => {
  try {
    let configuracao = await prisma.configuracaoTeste.findFirst();
    
    // Se não existir configuração, criar uma padrão
    if (!configuracao) {
      configuracao = await prisma.configuracaoTeste.create({
        data: {
          teste_ativo: true,
          tempo_limite: 30,
          mostrar_progresso: true,
          permitir_voltar: false,
          randomizar_perguntas: false,
          randomizar_opcoes: false,
          pontuacao_minima: 0,
          pontuacao_maxima: 100,
          mensagem_inicio: 'Bem-vindo ao Teste de Múltiplas Inteligências! Responda as perguntas com sinceridade.',
          mensagem_fim: 'Obrigado por participar! Seus resultados foram processados.',
          instrucoes: 'Leia cada pergunta com atenção e escolha a opção que melhor representa você.',
          tema_cores: 'azul'
        }
      });
    }

    res.json({
      success: true,
      data: configuracao
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/configuracoes - Atualizar configurações do sistema
router.put('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      teste_ativo,
      tempo_limite,
      mostrar_progresso,
      permitir_voltar,
      randomizar_perguntas,
      randomizar_opcoes,
      pontuacao_minima,
      pontuacao_maxima,
      mensagem_inicio,
      mensagem_fim,
      instrucoes,
      tema_cores
    } = req.body;

    // Validações básicas
    if (tempo_limite < 5 || tempo_limite > 120) {
      return res.status(400).json({
        success: false,
        message: 'Tempo limite deve estar entre 5 e 120 minutos'
      });
    }

    if (pontuacao_minima >= pontuacao_maxima) {
      return res.status(400).json({
        success: false,
        message: 'Pontuação mínima deve ser menor que a máxima'
      });
    }

    // Buscar configuração existente
    let configuracao = await prisma.configuracaoTeste.findFirst();

    if (configuracao) {
      // Atualizar configuração existente
      configuracao = await prisma.configuracaoTeste.update({
        where: { id: configuracao.id },
        data: {
          teste_ativo: teste_ativo !== undefined ? teste_ativo : configuracao.teste_ativo,
          tempo_limite: tempo_limite || configuracao.tempo_limite,
          mostrar_progresso: mostrar_progresso !== undefined ? mostrar_progresso : configuracao.mostrar_progresso,
          permitir_voltar: permitir_voltar !== undefined ? permitir_voltar : configuracao.permitir_voltar,
          randomizar_perguntas: randomizar_perguntas !== undefined ? randomizar_perguntas : configuracao.randomizar_perguntas,
          randomizar_opcoes: randomizar_opcoes !== undefined ? randomizar_opcoes : configuracao.randomizar_opcoes,
          pontuacao_minima: pontuacao_minima !== undefined ? pontuacao_minima : configuracao.pontuacao_minima,
          pontuacao_maxima: pontuacao_maxima !== undefined ? pontuacao_maxima : configuracao.pontuacao_maxima,
          mensagem_inicio: mensagem_inicio || configuracao.mensagem_inicio,
          mensagem_fim: mensagem_fim || configuracao.mensagem_fim,
          instrucoes: instrucoes || configuracao.instrucoes,
          tema_cores: tema_cores || configuracao.tema_cores
        }
      });
    } else {
      // Criar nova configuração
      configuracao = await prisma.configuracaoTeste.create({
        data: {
          teste_ativo: teste_ativo || true,
          tempo_limite: tempo_limite || 30,
          mostrar_progresso: mostrar_progresso !== undefined ? mostrar_progresso : true,
          permitir_voltar: permitir_voltar !== undefined ? permitir_voltar : false,
          randomizar_perguntas: randomizar_perguntas !== undefined ? randomizar_perguntas : false,
          randomizar_opcoes: randomizar_opcoes !== undefined ? randomizar_opcoes : false,
          pontuacao_minima: pontuacao_minima || 0,
          pontuacao_maxima: pontuacao_maxima || 100,
          mensagem_inicio: mensagem_inicio || 'Bem-vindo ao Teste de Múltiplas Inteligências!',
          mensagem_fim: mensagem_fim || 'Obrigado por participar!',
          instrucoes: instrucoes || 'Leia cada pergunta com atenção e escolha a opção que melhor representa você.',
          tema_cores: tema_cores || 'azul'
        }
      });
    }

    res.json({
      success: true,
      data: configuracao,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/configuracoes/reset - Resetar configurações para padrão
router.post('/reset', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Excluir configuração existente
    await prisma.configuracaoTeste.deleteMany({});

    // Criar configuração padrão
    const configuracao = await prisma.configuracaoTeste.create({
      data: {
        teste_ativo: true,
        tempo_limite: 30,
        mostrar_progresso: true,
        permitir_voltar: false,
        randomizar_perguntas: false,
        randomizar_opcoes: false,
        pontuacao_minima: 0,
        pontuacao_maxima: 100,
        mensagem_inicio: 'Bem-vindo ao Teste de Múltiplas Inteligências! Responda as perguntas com sinceridade.',
        mensagem_fim: 'Obrigado por participar! Seus resultados foram processados.',
        instrucoes: 'Leia cada pergunta com atenção e escolha a opção que melhor representa você.',
        tema_cores: 'azul'
      }
    });

    res.json({
      success: true,
      data: configuracao,
      message: 'Configurações resetadas para o padrão'
    });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
