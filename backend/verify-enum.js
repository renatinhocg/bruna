import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar os valores do enum
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'TaskStatus'
      ORDER BY pg_enum.enumsortorder;
    `;
    
    console.log('✅ Valores do enum TaskStatus no banco:');
    result.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.enumlabel}`);
    });
    
    // Verificar se há tarefas com os status antigos
    const tasksCount = await prisma.task.groupBy({
      by: ['status'],
      _count: true
    });
    
    console.log('\n📊 Distribuição de tarefas por status:');
    tasksCount.forEach(item => {
      console.log(`  ${item.status}: ${item._count} tarefas`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
