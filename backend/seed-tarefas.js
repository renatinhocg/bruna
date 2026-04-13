import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function seedTarefas() {
  try {
    console.log('🌱 Criando tarefas de casa de exemplo...');

    // Buscar um usuário de teste (ou criar se não existir)
    let usuario = await prisma.usuario.findFirst({
      where: { tipo: 'cliente' }
    });

    if (!usuario) {
      console.log('❌ Nenhum usuário cliente encontrado. Crie um usuário primeiro.');
      return;
    }

    console.log(`✅ Usando usuário: ${usuario.nome} (ID: ${usuario.id})`);

    // Criar tarefas de exemplo
    const tarefas = [
      {
        usuario_id: usuario.id,
        titulo: 'Entrevista com Marcos',
        descricao: 'Realizar entrevista de acompanhamento com Marcos',
        data: new Date('2025-11-04'),
        concluida: false
      },
      {
        usuario_id: usuario.id,
        titulo: 'Entrevista com Carlos',
        descricao: 'Realizar entrevista de acompanhamento com Carlos',
        data: new Date('2025-11-04'),
        concluida: false
      },
      {
        usuario_id: usuario.id,
        titulo: 'Atualizar currículo',
        descricao: 'Revisar e atualizar currículo conforme orientações',
        data: new Date('2025-11-10'),
        concluida: true
      }
    ];

    for (const tarefa of tarefas) {
      await prisma.tarefaCasa.create({ data: tarefa });
      console.log(`✅ Tarefa criada: ${tarefa.titulo}`);
    }

    console.log('\n✅ Seed de tarefas concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tarefas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTarefas();
