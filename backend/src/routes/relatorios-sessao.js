import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /relatorios-sessao - Listar relatórios (admin vê todos, usuário vê apenas os seus)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { agendamento_id, usuario_id } = req.query;
    const where = {};
    
    if (agendamento_id) {
      where.agendamento_id = parseInt(agendamento_id);
    }
    
    // Se não for admin, filtrar apenas relatórios do usuário
    if (req.user.tipo !== 'admin' && usuario_id) {
      where.agendamento = {
        usuario_id: parseInt(usuario_id)
      };
      where.visivel_cliente = true; // Cliente só vê relatórios visíveis
    }

    const relatorios = await prisma.relatorioSessao.findMany({
      where,
      include: {
        agendamento: {
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
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(relatorios);
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    res.status(500).json({ erro: 'Erro ao buscar relatórios' });
  }
});

// GET /relatorios-sessao/:id - Buscar relatório específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const relatorio = await prisma.relatorioSessao.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                avatar_url: true
              }
            }
          }
        }
      }
    });

    if (!relatorio) {
      return res.status(404).json({ erro: 'Relatório não encontrado' });
    }

    // Verificar permissão: admin pode ver tudo, cliente só vê relatórios visíveis e seus
    if (req.user.tipo !== 'admin') {
      if (relatorio.agendamento.usuario_id !== req.user.id || !relatorio.visivel_cliente) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }
    }

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({ erro: 'Erro ao buscar relatório' });
  }
});

// GET /relatorios-sessao/agendamento/:agendamento_id - Buscar relatório por agendamento
router.get('/agendamento/:agendamento_id', authenticateToken, async (req, res) => {
  try {
    const relatorio = await prisma.relatorioSessao.findUnique({
      where: { agendamento_id: parseInt(req.params.agendamento_id) },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                avatar_url: true
              }
            }
          }
        }
      }
    });

    if (!relatorio) {
      return res.status(404).json({ erro: 'Relatório não encontrado para este agendamento' });
    }

    // Verificar permissão
    if (req.user.tipo !== 'admin') {
      if (relatorio.agendamento.usuario_id !== req.user.id || !relatorio.visivel_cliente) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }
    }

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({ erro: 'Erro ao buscar relatório' });
  }
});

// POST /relatorios-sessao - Criar novo relatório (apenas admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      agendamento_id,
      resumo_sessao,
      objetivos_alcancados,
      proximos_passos,
      observacoes_profissional,
      avaliacao_progresso,
      temas_abordados,
      pontos_positivos,
      pontos_atencao,
      recomendacoes,
      proxima_sessao_sugerida,
      anexos,
      visivel_cliente
    } = req.body;

    // Verificar se o agendamento existe
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(agendamento_id) }
    });

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    // Verificar se já existe relatório para este agendamento
    const relatorioExistente = await prisma.relatorioSessao.findUnique({
      where: { agendamento_id: parseInt(agendamento_id) }
    });

    if (relatorioExistente) {
      return res.status(400).json({ erro: 'Já existe um relatório para este agendamento' });
    }

    const relatorio = await prisma.relatorioSessao.create({
      data: {
        agendamento_id: parseInt(agendamento_id),
        resumo_sessao,
        objetivos_alcancados,
        proximos_passos,
        observacoes_profissional,
        avaliacao_progresso: avaliacao_progresso ? parseInt(avaliacao_progresso) : null,
        temas_abordados,
        pontos_positivos,
        pontos_atencao,
        recomendacoes,
        proxima_sessao_sugerida: proxima_sessao_sugerida ? new Date(proxima_sessao_sugerida) : null,
        anexos,
        visivel_cliente: visivel_cliente !== undefined ? visivel_cliente : true
      },
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(relatorio);
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    res.status(500).json({ erro: 'Erro ao criar relatório' });
  }
});

// PUT /relatorios-sessao/:id - Atualizar relatório (apenas admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      resumo_sessao,
      objetivos_alcancados,
      proximos_passos,
      observacoes_profissional,
      avaliacao_progresso,
      temas_abordados,
      pontos_positivos,
      pontos_atencao,
      recomendacoes,
      proxima_sessao_sugerida,
      anexos,
      visivel_cliente
    } = req.body;

    const updateData = {};
    if (resumo_sessao !== undefined) updateData.resumo_sessao = resumo_sessao;
    if (objetivos_alcancados !== undefined) updateData.objetivos_alcancados = objetivos_alcancados;
    if (proximos_passos !== undefined) updateData.proximos_passos = proximos_passos;
    if (observacoes_profissional !== undefined) updateData.observacoes_profissional = observacoes_profissional;
    if (avaliacao_progresso !== undefined) updateData.avaliacao_progresso = avaliacao_progresso ? parseInt(avaliacao_progresso) : null;
    if (temas_abordados !== undefined) updateData.temas_abordados = temas_abordados;
    if (pontos_positivos !== undefined) updateData.pontos_positivos = pontos_positivos;
    if (pontos_atencao !== undefined) updateData.pontos_atencao = pontos_atencao;
    if (recomendacoes !== undefined) updateData.recomendacoes = recomendacoes;
    if (proxima_sessao_sugerida !== undefined) updateData.proxima_sessao_sugerida = proxima_sessao_sugerida ? new Date(proxima_sessao_sugerida) : null;
    if (anexos !== undefined) updateData.anexos = anexos;
    if (visivel_cliente !== undefined) updateData.visivel_cliente = visivel_cliente;

    const relatorio = await prisma.relatorioSessao.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        agendamento: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error);
    res.status(500).json({ erro: 'Erro ao atualizar relatório' });
  }
});

// DELETE /relatorios-sessao/:id - Excluir relatório (apenas admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.relatorioSessao.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ mensagem: 'Relatório excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir relatório:', error);
    res.status(500).json({ erro: 'Erro ao excluir relatório' });
  }
});

export default router;
