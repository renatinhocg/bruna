import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /resultados - Listar resultados (com filtros)
router.get('/', async (req, res) => {
  try {
    const { usuario_id, teste_id } = req.query;
    const where = {};
    if (usuario_id) where.usuario_id = parseInt(usuario_id);
    if (teste_id) where.teste_id = parseInt(teste_id);

    const resultados = await prisma.resultadoTeste.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        teste: {
          select: {
            id: true,
            titulo: true
          }
        }
      },
      orderBy: { criado_em: 'desc' }
    });
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar resultados' });
  }
});

// GET /resultados/:id - Buscar resultado específico
router.get('/:id', async (req, res) => {
  try {
    const resultado = await prisma.resultadoTeste.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        teste: {
          select: {
            id: true,
            titulo: true,
            descricao: true
          }
        }
      }
    });
    if (!resultado) return res.status(404).json({ erro: 'Resultado não encontrado' });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar resultado' });
  }
});

// POST /resultados - Salvar resultado de teste
router.post('/', async (req, res) => {
  try {
    const { usuario_id, teste_id, respostas, pontuacao_total, concluido } = req.body;

    // Verificar se usuário e teste existem
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) }
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const teste = await prisma.teste.findUnique({
      where: { id: parseInt(teste_id) }
    });
    if (!teste) return res.status(404).json({ erro: 'Teste não encontrado' });

    // Verificar se já existe um resultado para este usuário/teste
    const resultadoExistente = await prisma.resultadoTeste.findFirst({
      where: {
        usuario_id: parseInt(usuario_id),
        teste_id: parseInt(teste_id)
      }
    });

    let resultado;
    if (resultadoExistente) {
      // Atualizar resultado existente
      resultado = await prisma.resultadoTeste.update({
        where: { id: resultadoExistente.id },
        data: {
          respostas,
          pontuacao_total: pontuacao_total || 0,
          concluido: concluido || false
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          teste: {
            select: {
              id: true,
              titulo: true
            }
          }
        }
      });
    } else {
      // Criar novo resultado
      resultado = await prisma.resultadoTeste.create({
        data: {
          usuario_id: parseInt(usuario_id),
          teste_id: parseInt(teste_id),
          respostas,
          pontuacao_total: pontuacao_total || 0,
          concluido: concluido || false
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          teste: {
            select: {
              id: true,
              titulo: true
            }
          }
        }
      });
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao salvar resultado' });
  }
});

// PUT /resultados/:id - Atualizar resultado
router.put('/:id', async (req, res) => {
  try {
    const { respostas, pontuacao_total, concluido } = req.body;
    const resultado = await prisma.resultadoTeste.update({
      where: { id: parseInt(req.params.id) },
      data: {
        respostas,
        pontuacao_total,
        concluido
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        teste: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar resultado' });
  }
});

// DELETE /resultados/:id - Excluir resultado
router.delete('/:id', async (req, res) => {
  try {
    await prisma.resultadoTeste.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ mensagem: 'Resultado excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir resultado' });
  }
});

export default router;