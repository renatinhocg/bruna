import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function checkAgendamentos() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
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

    console.log('\n=== AGENDAMENTOS NO BANCO ===');
    console.log('Total:', agendamentos.length);
    console.log('\nDetalhes:');
    agendamentos.forEach((ag, index) => {
      console.log(`\n${index + 1}. Agendamento ID: ${ag.id}`);
      console.log(`   Usuário ID: ${ag.usuario_id}`);
      console.log(`   Usuário Nome: ${ag.usuario?.nome}`);
      console.log(`   Usuário Email: ${ag.usuario?.email}`);
      console.log(`   Título: ${ag.titulo}`);
      console.log(`   Data/Hora: ${ag.data_hora}`);
      console.log(`   Status: ${ag.status}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgendamentos();
