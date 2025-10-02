import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/relatorios/estatisticas - Estatísticas gerais dos testes
router.get('/estatisticas', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    // Filtros de data
    const filtros = {};
    if (dataInicio && dataFim) {
      filtros.createdAt = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      };
    }

    // Total de testes realizados
    const totalTestes = await prisma.testeInteligencia.count({
      where: {
        ...filtros,
        autorizado: true
      }
    });

    // Total de testes não finalizados (para calcular taxa de conclusão)
    const totalInicializados = await prisma.testeInteligencia.count({
      where: filtros
    });

    // Buscar todos os testes autorizados para cálculos
    const testes = await prisma.testeInteligencia.findMany({
      where: {
        ...filtros,
        autorizado: true
      },
      include: {
        resultados: {
          include: {
            categoria: true
          }
        }
      }
    });

    // Calcular estatísticas
    let somaTempos = 0;
    let somaPontuacoes = 0;
    let contadorTestes = 0;

    testes.forEach(teste => {
      if (teste.resultados && teste.resultados.length > 0) {
        // Tempo médio (usando tempo_resposta que existe no schema)
        if (teste.tempo_resposta) {
          somaTempos += teste.tempo_resposta;
        }
        
        // Pontuação média da inteligência dominante (maior percentual)
        const maiorPercentual = Math.max(...teste.resultados.map(r => r.percentual));
        somaPontuacoes += maiorPercentual;
        contadorTestes++;
      }
    });

    const mediaPontuacao = contadorTestes > 0 ? somaPontuacoes / contadorTestes : 0;
    const tempoMedio = contadorTestes > 0 ? somaTempos / contadorTestes : 0;
    const taxaConclusao = totalInicializados > 0 ? (totalTestes / totalInicializados) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalTestes,
        mediaPontuacao: Math.round(mediaPontuacao * 10) / 10,
        taxaConclusao: Math.round(taxaConclusao * 10) / 10,
        tempoMedio: Math.round(tempoMedio * 10) / 10
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

// GET /api/relatorios/ranking-inteligencias - Ranking das inteligências mais comuns
router.get('/ranking-inteligencias', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    // Filtros de data
    const filtros = {};
    if (dataInicio && dataFim) {
      filtros.createdAt = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      };
    }

    // Buscar todos os testes autorizados
    const testes = await prisma.testeInteligencia.findMany({
      where: {
        ...filtros,
        autorizado: true
      },
      include: {
        resultados: {
          include: {
            categoria: true
          },
          orderBy: {
            percentual: 'desc'
          }
        }
      }
    });

    // Contar inteligências dominantes
    const contadorInteligencias = {};
    let totalTestesComResultados = 0;

    testes.forEach(teste => {
      if (teste.resultados && teste.resultados.length > 0) {
        // A primeira inteligência é a dominante (maior percentual)
        const inteligenciaDominante = teste.resultados[0];
        const categoriaId = inteligenciaDominante.categoria.id;
        
        if (!contadorInteligencias[categoriaId]) {
          contadorInteligencias[categoriaId] = {
            categoria: inteligenciaDominante.categoria,
            quantidade: 0
          };
        }
        
        contadorInteligencias[categoriaId].quantidade++;
        totalTestesComResultados++;
      }
    });

    // Converter para array e calcular percentuais
    const ranking = Object.values(contadorInteligencias).map(item => ({
      nome: item.categoria.nome,
      cor: item.categoria.cor,
      quantidade: item.quantidade,
      percentual: totalTestesComResultados > 0 ? 
        Math.round((item.quantidade / totalTestesComResultados) * 1000) / 10 : 0
    }));

    // Ordenar por quantidade (decrescente)
    ranking.sort((a, b) => b.quantidade - a.quantidade);

    res.json({
      success: true,
      data: ranking
    });

  } catch (error) {
    console.error('Erro ao buscar ranking de inteligências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/relatorios/distribuicao-mensal - Distribuição de testes por mês
router.get('/distribuicao-mensal', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { ano } = req.query;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    // Buscar testes do ano especificado
    const inicioAno = new Date(anoAtual, 0, 1);
    const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59);

    const testes = await prisma.testeInteligencia.findMany({
      where: {
        createdAt: {
          gte: inicioAno,
          lte: fimAno
        },
        autorizado: true
      },
      select: {
        createdAt: true
      }
    });

    // Agrupar por mês
    const distribuicao = Array.from({ length: 12 }, (_, index) => ({
      mes: index + 1,
      nome: new Date(anoAtual, index, 1).toLocaleDateString('pt-BR', { month: 'long' }),
      quantidade: 0
    }));

    testes.forEach(teste => {
      const mes = teste.createdAt.getMonth();
      distribuicao[mes].quantidade++;
    });

    res.json({
      success: true,
      data: distribuicao
    });

  } catch (error) {
    console.error('Erro ao buscar distribuição mensal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/relatorios/exportar - Exportar relatórios em diferentes formatos
router.get('/exportar', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { tipo, formato = 'json' } = req.query;

    let dados = {};

    switch (tipo) {
      case 'completo':
        // Buscar dados completos
        const testesCompletos = await prisma.testeInteligencia.findMany({
          where: { autorizado: true },
          include: {
            resultados: {
              include: {
                categoria: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        dados = {
          testes: testesCompletos,
          geradoEm: new Date().toISOString(),
          total: testesCompletos.length
        };
        break;

      case 'estatisticas':
        // Reutilizar lógica de estatísticas
        const estatisticasReq = await fetch(`${req.protocol}://${req.get('host')}/api/relatorios/estatisticas`, {
          headers: { 'Authorization': req.headers.authorization }
        });
        const estatisticasData = await estatisticasReq.json();
        dados = estatisticasData.data;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de exportação inválido'
        });
    }

    // Por enquanto, retornar JSON
    // TODO: Implementar exportação para CSV, Excel, etc.
    res.json({
      success: true,
      data: dados,
      formato
    });

  } catch (error) {
    console.error('Erro ao exportar relatórios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
