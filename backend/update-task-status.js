import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function updateTaskStatus() {
  console.log('🔄 Atualizando status das tasks...');

  try {
    // Atualizar HOMOLOGACAO para EM_TESTE
    const homologacao = await prisma.$executeRaw`
      UPDATE tasks 
      SET status = 'EM_TESTE' 
      WHERE status = 'HOMOLOGACAO'
    `;
    console.log(`✅ ${homologacao} tasks atualizadas de HOMOLOGACAO → EM_TESTE`);

    // Atualizar PRODUCAO para CONCLUIDO
    const producao = await prisma.$executeRaw`
      UPDATE tasks 
      SET status = 'CONCLUIDO' 
      WHERE status = 'PRODUCAO'
    `;
    console.log(`✅ ${producao} tasks atualizadas de PRODUCAO → CONCLUIDO`);

    console.log('✨ Atualização concluída! Agora você pode rodar a migration.');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTaskStatus();
