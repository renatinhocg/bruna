import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar testes disponíveis com status de conclusão do usuário
router.get('/disponiveis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar permissões dos testes
    const permissoes = await prisma.permissaoTeste.findMany({
      where: { usuario_id: userId }
    });

    const permissoesMap = {};
    permissoes.forEach(p => {
      permissoesMap[p.tipo_teste] = p.liberado;
    });
    
    console.log('🔐 Permissões do usuário:', permissoesMap);

    // Verificar quais testes o usuário já realizou
    const [testesDISC, testesInteligencia, testesDominancia] = await Promise.all([
      prisma.testeDISC.findMany({
        where: { usuario_id: userId },
        select: { id: true }
      }),
      prisma.testeInteligencia.findMany({
        where: { usuario_id: userId },
        select: { id: true }
      }),
      prisma.testeDominancia.findMany({
        where: { usuario_id: userId },
        select: { id: true }
      })
    ]);

    // Montar lista de testes com informações e verificar permissões
    const testesDisponiveis = [
      {
        tipo: 'disc',
        titulo: 'DISC',
        descricao: 'Avalie seu perfil comportamental: Dominância, Influência, Estabilidade e Conformidade',
        rota: '/cliente/teste-disc',
        rotaResultado: '/cliente/resultado-disc',
        imagem: 'https://images.unsplash.com/photo-1554224311-beee460ae6ba?w=400&h=300&fit=crop',
        realizado: testesDISC.length > 0,
        ativo: permissoesMap['disc'] === true
      },
      {
        tipo: 'inteligencias',
        titulo: 'Múltiplas Inteligências',
        descricao: 'Descubra suas inteligências dominantes e como aplicá-las no trabalho',
        rota: '/cliente/teste-inteligencias',
        rotaResultado: '/cliente/resultados-inteligencias',
        imagem: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&h=300&fit=crop',
        realizado: testesInteligencia.length > 0,
        ativo: permissoesMap['inteligencias'] === true
      },
      {
        tipo: 'dominancia',
        titulo: 'Dominância Cerebral',
        descricao: 'Identifique seu perfil de dominância cerebral baseado no modelo de Ned Herrmann',
        rota: '/cliente/teste-dominancia',
        rotaResultado: '/cliente/resultado-dominancia',
        imagem: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
        realizado: testesDominancia.length > 0,
        ativo: permissoesMap['dominancia'] === true
      }
    ];

    res.json(testesDisponiveis);
  } catch (error) {
    console.error('Erro ao buscar testes disponíveis:', error);
    res.status(500).json({ erro: 'Erro ao buscar testes disponíveis' });
  }
});

export default router;
