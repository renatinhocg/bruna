import prisma from './src/config/prisma.js';

async function verificarTestes() {
  try {
    // Total de testes
    const totalTestes = await prisma.testeInteligencia.count();
    console.log('📊 Total de testes no banco:', totalTestes);

    // Testes autorizados
    const testesAutorizados = await prisma.testeInteligencia.count({
      where: { autorizado: true }
    });
    console.log('✅ Testes autorizados:', testesAutorizados);

    // Testes de hoje
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const testesHoje = await prisma.testeInteligencia.count({
      where: {
        created_at: {
          gte: inicioDoDia,
          lte: fimDoDia
        }
      }
    });
    console.log('📅 Testes hoje:', testesHoje);

    // Listar últimos 5 testes
    const ultimos = await prisma.testeInteligencia.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        usuario: {
          select: { nome: true, email: true }
        }
      }
    });

    console.log('\n📋 Últimos testes:');
    ultimos.forEach(teste => {
      console.log(`- ID: ${teste.id}, Usuário: ${teste.usuario?.nome || 'N/A'}, Autorizado: ${teste.autorizado}, Data: ${teste.created_at}`);
    });

    // Categorias
    const categorias = await prisma.categoria.count({ where: { ativo: true } });
    console.log('\n📚 Categorias ativas:', categorias);

    // Perguntas
    const perguntas = await prisma.perguntaInteligencia.count({ where: { ativo: true } });
    console.log('❓ Perguntas ativas:', perguntas);

    // Possibilidades
    const possibilidades = await prisma.possibilidadeResposta.count({ where: { ativo: true } });
    console.log('⚙️ Possibilidades ativas:', possibilidades);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTestes();
