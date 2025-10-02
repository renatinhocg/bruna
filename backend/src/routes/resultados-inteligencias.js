import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/resultados-inteligencias - Resultados do teste de múltiplas inteligências do usuário autenticado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    // Buscar o teste de inteligências mais recente, concluído e autorizado do usuário
    const teste = await prisma.testeInteligencia.findFirst({
      where: {
        usuario_id: usuarioId,
        concluido: true,
        autorizado: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    if (!teste) {
      return res.json([]);
    }
    // Buscar resultados desse teste
    const resultados = await prisma.resultadoInteligencia.findMany({
      where: { teste_id: teste.id },
      include: {
        categoria: {
          include: {
            _count: {
              select: { perguntas: true }
            }
          }
        }
      },
      orderBy: { percentual: 'desc' }
    });
    if (!resultados || resultados.length === 0) {
      return res.json([]);
    }
    // Função para gerar slug a partir do nome
    function slugify(str) {
      return str
        .normalize('NFD').replace(/[^\w\s-]/g, '') // remove acentos
        .replace(/[^a-zA-Z0-9]+/g, '-') // troca não letras por hífen
        .replace(/(^-|-$)/g, '') // remove hífens do início/fim
        .toLowerCase();
    }
    // Retornar o objeto completo da categoria para o frontend exibir tudo
    const resultadosFormatados = resultados.map(r => {
      let tipoInteligencia = '';
      if (r.categoria?.slug) {
        tipoInteligencia = r.categoria.slug;
      } else if (r.categoria?.nome) {
        tipoInteligencia = slugify(r.categoria.nome);
      }
      return {
        id: r.id,
        tipoInteligencia,
        pontuacao: r.pontuacao,
        percentual: r.percentual,
        categoria: r.categoria, // objeto completo
      };
    });
    res.json(resultadosFormatados);
  } catch (error) {
    console.error('Erro ao buscar resultados de inteligências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;