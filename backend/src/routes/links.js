import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// Buscar todos os links ativos (público)
router.get('/public', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
      select: {
        id: true,
        titulo: true,
        url: true,
        icone: true,
        imagem_url: true,
        descricao: true,
        cor: true,
        ordem: true,
        _count: {
          select: { clicks: true }
        }
      }
    });

    res.json(links);
  } catch (error) {
    console.error('Erro ao buscar links públicos:', error);
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

// Registrar clique (público)
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const { referer } = req.body;
    
    // Capturar informações do cliente
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    await prisma.clickLog.create({
      data: {
        link_id: parseInt(id),
        ip_address,
        user_agent,
        referer: referer || req.headers.referer
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    res.status(500).json({ error: 'Erro ao registrar clique' });
  }
});

// Buscar todos os links com estatísticas (admin)
router.get('/', async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    });

    // Buscar cliques dos últimos 7 dias para cada link
    const linksComStats = await Promise.all(
      links.map(async (link) => {
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

        const clicksUltimos7Dias = await prisma.clickLog.count({
          where: {
            link_id: link.id,
            clicked_at: {
              gte: seteDiasAtras
            }
          }
        });

        return {
          ...link,
          total_clicks: link._count.clicks,
          clicks_ultimos_7_dias: clicksUltimos7Dias
        };
      })
    );

    res.json(linksComStats);
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

// Criar novo link (admin)
router.post('/', async (req, res) => {
  try {
    const { titulo, url, icone, imagem_url, descricao, cor, ordem, ativo, usuario_id } = req.body;

    const link = await prisma.link.create({
      data: {
        titulo,
        url,
        icone: icone || '🔗',
        imagem_url,
        descricao,
        cor: cor || '#1890ff',
        ordem: ordem || 0,
        ativo: ativo !== undefined ? ativo : true,
        usuario_id
      }
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Erro ao criar link:', error);
    res.status(500).json({ error: 'Erro ao criar link' });
  }
});

// Atualizar link (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, url, icone, imagem_url, descricao, cor, ordem, ativo } = req.body;

    const link = await prisma.link.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        url,
        icone,
        imagem_url,
        descricao,
        cor,
        ordem,
        ativo
      }
    });

    res.json(link);
  } catch (error) {
    console.error('Erro ao atualizar link:', error);
    res.status(500).json({ error: 'Erro ao atualizar link' });
  }
});

// Deletar link (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.link.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar link:', error);
    res.status(500).json({ error: 'Erro ao deletar link' });
  }
});

// Buscar estatísticas detalhadas de um link (admin)
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { dias = 30 } = req.query;

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(dias));

    const clicks = await prisma.clickLog.findMany({
      where: {
        link_id: parseInt(id),
        clicked_at: {
          gte: dataInicio
        }
      },
      orderBy: {
        clicked_at: 'desc'
      }
    });

    // Agrupar clicks por dia
    const clicksPorDia = clicks.reduce((acc, click) => {
      const data = click.clicked_at.toISOString().split('T')[0];
      acc[data] = (acc[data] || 0) + 1;
      return acc;
    }, {});

    // Agrupar por país (se disponível)
    const clicksPorPais = clicks.reduce((acc, click) => {
      const pais = click.pais || 'Desconhecido';
      acc[pais] = (acc[pais] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total_clicks: clicks.length,
      clicks_por_dia: clicksPorDia,
      clicks_por_pais: clicksPorPais,
      ultimos_clicks: clicks.slice(0, 10)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
