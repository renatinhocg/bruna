import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function deletarPerguntas() {
  try {
    console.log('🗑️ Deletando todas as perguntas e possibilidades...');
    
    // Deletar possibilidades de resposta primeiro (devido à foreign key)
    await prisma.possibilidadeResposta.deleteMany({});
    console.log('✅ Possibilidades deletadas');
    
    // Deletar perguntas
    await prisma.perguntaInteligencia.deleteMany({});
    console.log('✅ Perguntas deletadas');
    
    console.log('🎉 Limpeza concluída! Agora você pode cadastrar as perguntas novamente.');
    
  } catch (error) {
    console.error('❌ Erro ao deletar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletarPerguntas();
