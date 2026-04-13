import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function deletarPerguntaDuplicada() {
  console.log('🗑️  Deletando pergunta duplicada...\n');

  try {
    // Primeiro vamos verificar a pergunta
    const pergunta = await prisma.perguntaInteligencia.findUnique({
      where: { id: 48 },
      include: {
        categoria: true
      }
    });

    if (pergunta) {
      console.log('📝 Pergunta a ser deletada:');
      console.log(`   ID: ${pergunta.id}`);
      console.log(`   Categoria: ${pergunta.categoria.nome}`);
      console.log(`   Texto: ${pergunta.texto}`);
      console.log('');

      // Deletar a pergunta (as respostas serão deletadas automaticamente por causa do onDelete: Cascade)
      await prisma.perguntaInteligencia.delete({
        where: { id: 48 }
      });

      console.log('✅ Pergunta deletada com sucesso!\n');

      // Verificar quantas perguntas restaram
      const count = await prisma.perguntaInteligencia.count({
        where: {
          categoria_id: pergunta.categoria_id
        }
      });

      console.log(`📊 Agora a categoria "${pergunta.categoria.nome}" tem ${count} perguntas\n`);

    } else {
      console.log('⚠️  Pergunta ID 48 não encontrada no banco.\n');
    }

  } catch (error) {
    console.error('❌ Erro ao deletar pergunta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletarPerguntaDuplicada();
