import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/estatisticas - Retorna estatísticas do usuário
router.get('/estatisticas', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    console.log('📊 Buscando estatísticas para usuário ID:', usuarioId);

    // Buscar testes de inteligência concluídos
    const testesInteligencia = await prisma.testeInteligencia.findMany({
      where: {
        usuario_id: usuarioId,
        concluido: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    console.log('✅ Testes de Inteligência encontrados:', testesInteligencia.length);

    // Buscar testes de dominância cerebral concluídos
    const testesDominancia = await prisma.testeDominancia.findMany({
      where: {
        usuario_id: usuarioId,
        concluido: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    console.log('✅ Testes de Dominância encontrados:', testesDominancia.length);

    // Buscar testes DISC concluídos
    const testesDISC = await prisma.testeDISC.findMany({
      where: {
        usuario_id: usuarioId,
        concluido: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    console.log('✅ Testes DISC encontrados:', testesDISC.length);

    // Buscar agendamentos
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        usuario_id: usuarioId
      },
      orderBy: {
        data_hora: 'desc'
      },
      take: 10
    });
    console.log('✅ Agendamentos encontrados:', agendamentos.length);

    // Calcular totais
    const totalTestes = testesInteligencia.length + testesDominancia.length + testesDISC.length;
    const totalAgendamentos = agendamentos.length;

    // Criar lista de atividades recentes
    const atividadesRecentes = [];

    // Adicionar testes de inteligência
    testesInteligencia.slice(0, 5).forEach(teste => {
      atividadesRecentes.push({
        tipo: 'teste',
        titulo: 'Teste de Múltiplas Inteligências',
        descricao: `Completado em ${new Date(teste.created_at).toLocaleDateString('pt-BR')}`,
        data: teste.created_at,
        id: teste.id,
        rota: '/cliente/resultado-inteligencias'
      });
    });

    // Adicionar testes de dominância
    testesDominancia.slice(0, 5).forEach(teste => {
      atividadesRecentes.push({
        tipo: 'teste',
        titulo: 'Teste de Dominância Cerebral',
        descricao: `Completado em ${new Date(teste.created_at).toLocaleDateString('pt-BR')}`,
        data: teste.created_at,
        id: teste.id,
        rota: '/cliente/resultado-dominancia'
      });
    });

    // Adicionar testes DISC
    testesDISC.slice(0, 5).forEach(teste => {
      atividadesRecentes.push({
        tipo: 'teste',
        titulo: 'Teste de Perfil Comportamental DISC',
        descricao: `Completado em ${new Date(teste.created_at).toLocaleDateString('pt-BR')}`,
        data: teste.created_at,
        id: teste.id,
        rota: '/cliente/resultado-disc'
      });
    });

    // Adicionar agendamentos
    agendamentos.slice(0, 5).forEach(agendamento => {
      const dataAgendamento = new Date(agendamento.data_hora);
      const status = dataAgendamento > new Date() ? 'Agendado' : 'Realizado';
      atividadesRecentes.push({
        tipo: 'agendamento',
        titulo: agendamento.tipo || 'Sessão de Coaching',
        descricao: `${status} para ${dataAgendamento.toLocaleDateString('pt-BR')} às ${dataAgendamento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        data: agendamento.data_hora,
        id: agendamento.id,
        status: agendamento.status
      });
    });

    // Ordenar atividades por data (mais recentes primeiro)
    atividadesRecentes.sort((a, b) => new Date(b.data) - new Date(a.data));

    // Limitar a 10 atividades
    const atividadesLimitadas = atividadesRecentes.slice(0, 10);

    // Determinar próximos passos
    const proximosPassos = [];

    // Verificar testes não realizados
    if (testesInteligencia.length === 0) {
      proximosPassos.push({
        titulo: 'Complete o Teste de Múltiplas Inteligências',
        rota: '/cliente/teste-inteligencias'
      });
    }

    if (testesDominancia.length === 0) {
      proximosPassos.push({
        titulo: 'Complete o Teste de Dominância Cerebral',
        rota: '/cliente/teste-dominancia'
      });
    }

    if (testesDISC.length === 0) {
      proximosPassos.push({
        titulo: 'Complete o Teste de Perfil Comportamental DISC',
        rota: '/cliente/teste-disc'
      });
    }

    // Verificar agendamentos futuros
    const agendamentosFuturos = agendamentos.filter(a => new Date(a.data_hora) > new Date());
    if (agendamentosFuturos.length === 0) {
      proximosPassos.push({
        titulo: 'Agende sua próxima sessão de coaching',
        rota: '/cliente/agendamentos'
      });
    }

    // Se todos os testes foram feitos
    if (proximosPassos.length === 0) {
      proximosPassos.push(
        {
          titulo: 'Revise seus resultados e objetivos profissionais',
          rota: '/cliente/testes'
        },
        {
          titulo: 'Explore seus relatórios de desenvolvimento',
          rota: '/cliente/testes'
        }
      );
    }

    res.json({
      success: true,
      estatisticas: {
        testesRealizados: totalTestes,
        agendamentos: totalAgendamentos,
        testesInteligencia: testesInteligencia.length,
        testesDominancia: testesDominancia.length,
        testesDISC: testesDISC.length
      },
      atividadesRecentes: atividadesLimitadas,
      proximosPassos: proximosPassos.slice(0, 5)
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

export default router;
