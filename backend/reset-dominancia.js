import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function reset() {
  try {
    console.log('🗑️  Limpando dados antigos...');
    
    await prisma.respostaDominancia.deleteMany();
    console.log('✓ Respostas deletadas');
    
    await prisma.testeDominancia.deleteMany();
    console.log('✓ Testes deletados');
    
    await prisma.opcaoDominancia.deleteMany();
    console.log('✓ Opções deletadas');
    
    await prisma.questaoDominancia.deleteMany();
    console.log('✓ Questões deletadas');
    
    console.log('✅ Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
