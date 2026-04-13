import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function criarTarefasRenato() {
  try {
    // Buscar usuário Renato
    const renato = await prisma.usuario.findFirst({
      where: { 
        nome: { contains: 'Renato' }
      }
    });

    if (!renato) {
      console.log('❌ Usuário Renato não encontrado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${renato.nome} (ID: ${renato.id})`);

    // Deletar tarefas antigas
    await prisma.tarefaCasa.deleteMany({
      where: { usuario_id: renato.id }
    });

    // Criar novas tarefas
    const tarefas = [
      {
        usuario_id: renato.id,
        titulo: 'Entrevista com Marcos',
        descricao: 'Realizar entrevista de acompanhamento',
        data: new Date('2025-11-04'),
        concluida: false
      },
      {
        usuario_id: renato.id,
        titulo: 'Entrevista com Carlos',
        descricao: 'Realizar entrevista de acompanhamento',
        data: new Date('2025-11-04'),
        concluida: false
      }
    ];

    for (const tarefa of tarefas) {
      await prisma.tarefaCasa.create({ data: tarefa });
      console.log(`✅ Tarefa criada: ${tarefa.titulo}`);
    }

    console.log('\n✅ Tarefas criadas com sucesso para Renato!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarTarefasRenato();
